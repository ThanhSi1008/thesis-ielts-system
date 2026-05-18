import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import {
  PaymentProviderInterface,
  CheckoutResult,
  PaymentVerification,
} from "./payment-provider.interface";

// ─── Constants ─────────────────────────────────────────────
const VNPAY_VERSION = "2.1.0";
const VNPAY_COMMAND = "pay";
const VNPAY_CURRENCY_CODE = "VND";
const VNPAY_LOCALE = "vn";
const VNPAY_ORDER_TYPE = "other";

/**
 * VNPay payment provider for sandbox/production.
 * Implements redirect-based checkout: user is sent to VNPay's payment page,
 * then redirected back to the app with query parameters for verification.
 */
@Injectable()
export class VnpayPaymentProvider implements PaymentProviderInterface {
  private readonly logger = new Logger(VnpayPaymentProvider.name);

  // In-memory store of pending checkouts (maps sessionId → checkout data).
  // In production, use Redis or database instead.
  private pendingSessions = new Map<
    string,
    {
      userId: string;
      planId: string;
      amount: number;
      currency: string;
      planName: string;
      providerSubId: string;
    }
  >();

  // ─── Config from ENV ───────────────────────────────────
  private get tmnCode(): string {
    return (process.env.VNPAY_TMN_CODE ?? "").trim();
  }

  private get hashSecret(): string {
    return (process.env.VNPAY_HASH_SECRET ?? "").trim();
  }

  private get vnpayUrl(): string {
    return (process.env.VNPAY_URL ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html").trim();
  }

  private get returnUrl(): string {
    return (process.env.VNPAY_RETURN_URL ?? "http://localhost:3001/payment/vnpay-return").trim();
  }

  // ─── createCheckout ────────────────────────────────────
  async createCheckout(params: {
    userId: string;
    planId: string;
    planName: string;
    amount: number;   // In VND (e.g., 99000)
    currency: string;
    interval: string;
  }): Promise<CheckoutResult> {
    const sessionId = uuidv4().replace(/-/g, "").slice(0, 20); // VNPay TxnRef max ~20 chars
    const providerSubId = `vnp_sub_${uuidv4()}`;

    // Store session for later verification
    this.pendingSessions.set(sessionId, {
      userId: params.userId,
      planId: params.planId,
      amount: params.amount,
      currency: params.currency,
      planName: params.planName,
      providerSubId,
    });

    // Build VNPay payment URL
    const redirectUrl = this.buildPaymentUrl({
      txnRef: sessionId,
      amount: params.amount,
      currency: params.currency,
      orderInfo: `Thanh_toan_goi_${params.planId}`, // URL-safe, no spaces
      ipAddr: "127.0.0.1", // In production, pass the real user IP
    });

    this.logger.log(
      `[VNPay] Checkout created: txnRef=${sessionId}, plan=${params.planName}, amount=${params.amount} VND`,
    );

    // VNPay is redirect-based — return "pending" with the URL
    return {
      sessionId,
      providerSubId,
      redirectUrl,
      status: "pending",
    };
  }

  // ─── verifyPayment ─────────────────────────────────────
  /**
   * Verify payment using VNPay return/IPN query parameters.
   * Called by the backend after user returns from VNPay or via IPN callback.
   *
   * @param sessionId - The vnp_TxnRef from the return query params
   * @param vnpParams - Optional: full query params from VNPay return URL for hash verification
   */
  async verifyPayment(
    sessionId: string,
    vnpParams?: Record<string, string>,
  ): Promise<PaymentVerification> {
    const session = this.pendingSessions.get(sessionId);

    if (!session) {
      this.logger.warn(`[VNPay] Session not found for txnRef: ${sessionId}`);
      return { success: false, providerPayId: "", amount: 0, currency: "VND" };
    }

    // If vnpParams provided, verify the secure hash
    if (vnpParams) {
      const isValid = this.verifyReturnHash(vnpParams);
      if (!isValid) {
        this.logger.error(`[VNPay] Hash verification FAILED for txnRef: ${sessionId}`);
        return { success: false, providerPayId: "", amount: 0, currency: "VND" };
      }

      const responseCode = vnpParams["vnp_ResponseCode"];
      if (responseCode !== "00") {
        this.logger.warn(`[VNPay] Payment failed with code: ${responseCode} for txnRef: ${sessionId}`);
        this.pendingSessions.delete(sessionId);
        return { success: false, providerPayId: "", amount: 0, currency: "VND" };
      }
    }

    const providerPayId = vnpParams?.["vnp_TransactionNo"] ?? `vnp_pay_${uuidv4()}`;

    this.logger.log(
      `[VNPay] Payment verified: txnRef=${sessionId}, transactionNo=${providerPayId}, amount=${session.amount} VND`,
    );

    // Clean up
    this.pendingSessions.delete(sessionId);

    return {
      success: true,
      providerPayId: String(providerPayId),
      amount: session.amount,
      currency: session.currency,
    };
  }

  // ─── cancelSubscription ────────────────────────────────
  async cancelSubscription(providerSubId: string): Promise<{ success: boolean }> {
    // VNPay does not manage subscriptions — cancellation is handled locally
    this.logger.log(`[VNPay] Subscription canceled locally: ${providerSubId}`);
    return { success: true };
  }

  // ─── getSessionData (helper for service) ───────────────
  getSessionData(sessionId: string) {
    return this.pendingSessions.get(sessionId) ?? null;
  }

  // ═══════════════════════════════════════════════════════
  // PRIVATE: VNPay URL Building & Hash Verification
  // ═══════════════════════════════════════════════════════

  private buildPaymentUrl(params: {
    txnRef: string;
    amount: number;
    currency: string;
    orderInfo: string;
    ipAddr: string;
  }): string {
    const now = new Date();
    const createDate = this.formatDate(now);
    const expireDate = this.formatDate(new Date(now.getTime() + 15 * 60 * 1000));

    let amountInVnd = params.amount;
    if (params.currency === "USD") {
      const usdAmount = params.amount / 100;
      amountInVnd = Math.round(usdAmount * 25400);
    }
    const vnpAmount = amountInVnd * 100;

    const vnpParams: Record<string, string> = {
      vnp_Version: VNPAY_VERSION,
      vnp_Command: VNPAY_COMMAND,
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: VNPAY_LOCALE,
      vnp_CurrCode: VNPAY_CURRENCY_CODE,
      vnp_TxnRef: params.txnRef,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: VNPAY_ORDER_TYPE,
      vnp_Amount: String(vnpAmount),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sign trên raw values (không encode) — đúng với VNPay spec
    const signData = this.buildSignData(vnpParams);
    const secureHash = crypto
      .createHmac("sha512", this.hashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    // URLSearchParams tự encode đúng chuẩn khi build URL
    const urlParams = new URLSearchParams(vnpParams);
    urlParams.append("vnp_SecureHash", secureHash);
    return `${this.vnpayUrl}?${urlParams.toString()}`;
  }

  private verifyReturnHash(params: Record<string, string>): boolean {
    const receivedHash = params["vnp_SecureHash"];
    if (!receivedHash) return false;

    const verifyParams = { ...params };
    delete verifyParams["vnp_SecureHash"];
    delete verifyParams["vnp_SecureHashType"];

    // Params từ VNPay callback đã được framework URL-decode sẵn → sign raw
    const signData = this.buildSignData(verifyParams);
    const expectedHash = crypto
      .createHmac("sha512", this.hashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    return receivedHash.toLowerCase() === expectedHash.toLowerCase();
  }

  /**
   * Sort keys alphabetically, join as raw key=value pairs (không encode).
   * VNPay ký trên chuỗi raw — encode chỉ dùng khi build URL, không dùng khi ký.
   */
  private buildSignData(params: Record<string, string>): string {
    return Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    const offset = 7 * 60 * 60 * 1000;
    const gmt7Date = new Date(date.getTime() + offset);
    return (
      `${gmt7Date.getUTCFullYear()}${pad(gmt7Date.getUTCMonth() + 1)}${pad(gmt7Date.getUTCDate())}` +
      `${pad(gmt7Date.getUTCHours())}${pad(gmt7Date.getUTCMinutes())}${pad(gmt7Date.getUTCSeconds())}`
    );
  }
}
