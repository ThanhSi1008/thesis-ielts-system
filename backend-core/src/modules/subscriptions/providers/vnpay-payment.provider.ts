import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "../../../common/redis/redis.service";
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
const SESSION_TTL_SECONDS = 30 * 60; // 30 min (VNPay URL expires in 15 min; IPN may arrive later)
const SESSION_KEY_PREFIX = "vnpay:session:";

type VnpaySessionData = {
  userId: string;
  planId: string;
  amount: number;   // VND, e.g. 99000 (NOT × 100)
  currency: string;
  planName: string;
  providerSubId: string;
};

@Injectable()
export class VnpayPaymentProvider implements PaymentProviderInterface {
  private readonly logger = new Logger(VnpayPaymentProvider.name);

  constructor(private readonly redis: RedisService) {}

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
    amount: number;
    currency: string;
    interval: string;
    ipAddr?: string;
  }): Promise<CheckoutResult> {
    const sessionId = uuidv4().replace(/-/g, "").slice(0, 20); // VNPay TxnRef max ~20 chars
    const providerSubId = `vnp_sub_${uuidv4()}`;

    await this.redis.setJson<VnpaySessionData>(
      `${SESSION_KEY_PREFIX}${sessionId}`,
      {
        userId: params.userId,
        planId: params.planId,
        amount: params.amount,
        currency: params.currency,
        planName: params.planName,
        providerSubId,
      },
      SESSION_TTL_SECONDS,
    );

    const redirectUrl = this.buildPaymentUrl({
      txnRef: sessionId,
      amount: params.amount,
      currency: params.currency,
      orderInfo: `Thanh toan goi ${params.planName}`,
      ipAddr: params.ipAddr ?? "127.0.0.1",
    });

    this.logger.log(
      `[VNPay] Checkout created: txnRef=${sessionId}, plan=${params.planName}, amount=${params.amount} VND`,
    );

    return { sessionId, providerSubId, redirectUrl, status: "pending" };
  }

  // ─── verifyPayment ─────────────────────────────────────
  async verifyPayment(
    sessionId: string,
    vnpParams?: Record<string, string>,
  ): Promise<PaymentVerification> {
    const session = await this.redis.getJson<VnpaySessionData>(
      `${SESSION_KEY_PREFIX}${sessionId}`,
    );

    if (!session) {
      this.logger.warn(`[VNPay] Session not found: txnRef=${sessionId}`);
      return { success: false, providerPayId: "", amount: 0, currency: "VND" };
    }

    if (vnpParams) {
      if (!this.verifyHash(vnpParams)) {
        this.logger.error(`[VNPay] Hash FAILED: txnRef=${sessionId}`);
        return { success: false, providerPayId: "", amount: 0, currency: "VND" };
      }

      const responseCode = vnpParams["vnp_ResponseCode"];
      const transactionStatus = vnpParams["vnp_TransactionStatus"];
      if (responseCode !== "00" || transactionStatus !== "00") {
        this.logger.warn(
          `[VNPay] Not successful: txnRef=${sessionId}, responseCode=${responseCode}, transactionStatus=${transactionStatus}`,
        );
        await this.redis.del(`${SESSION_KEY_PREFIX}${sessionId}`);
        return { success: false, providerPayId: "", amount: 0, currency: "VND" };
      }
    }

    const providerPayId = vnpParams?.["vnp_TransactionNo"] ?? `vnp_pay_${uuidv4()}`;
    this.logger.log(
      `[VNPay] Verified: txnRef=${sessionId}, transactionNo=${providerPayId}, amount=${session.amount} VND`,
    );

    await this.redis.del(`${SESSION_KEY_PREFIX}${sessionId}`);
    return {
      success: true,
      providerPayId: String(providerPayId),
      amount: session.amount,
      currency: session.currency,
    };
  }

  // ─── cancelSubscription ────────────────────────────────
  async cancelSubscription(providerSubId: string): Promise<{ success: boolean }> {
    this.logger.log(`[VNPay] Canceled locally: ${providerSubId}`);
    return { success: true };
  }

  // ─── getSessionData ────────────────────────────────────
  async getSessionData(sessionId: string): Promise<VnpaySessionData | null> {
    return this.redis.getJson<VnpaySessionData>(`${SESSION_KEY_PREFIX}${sessionId}`);
  }

  // ─── verifyHash (public — dùng ở IPN handler để trả RspCode sớm) ─
  verifyHash(params: Record<string, string>): boolean {
    const receivedHash = params["vnp_SecureHash"];
    if (!receivedHash) return false;

    const verifyParams = { ...params };
    delete verifyParams["vnp_SecureHash"];
    delete verifyParams["vnp_SecureHashType"];

    // NestJS @Query() đã URL-decode params → re-apply sortObject để encode lại
    // Mirrors VNPay demo: vnp_Params = sortObject(req.query) → qs.stringify({encode:false})
    const signData = this.buildSignData(verifyParams);
    const expectedHash = crypto
      .createHmac("sha512", this.hashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    return receivedHash.toLowerCase() === expectedHash.toLowerCase();
  }

  // ═══════════════════════════════════════════════════════
  // PRIVATE
  // ═══════════════════════════════════════════════════════

  private buildPaymentUrl(params: {
    txnRef: string;
    amount: number;
    currency: string;
    orderInfo: string;
    ipAddr: string;
  }): string {
    // Set timezone để formatDate dùng giờ VN
    process.env.TZ = "Asia/Ho_Chi_Minh";
    const now = new Date();
    const createDate = this.formatDate(now);
    const expireDate = this.formatDate(new Date(now.getTime() + 15 * 60 * 1000));

    let amountInVnd = params.amount;
    if (params.currency === "USD") {
      amountInVnd = Math.round((params.amount / 100) * 25400);
    }

    const vnpParams: Record<string, string> = {
      vnp_Version: VNPAY_VERSION,
      vnp_Command: VNPAY_COMMAND,
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: VNPAY_LOCALE,
      vnp_CurrCode: VNPAY_CURRENCY_CODE,
      vnp_TxnRef: params.txnRef,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: VNPAY_ORDER_TYPE,
      vnp_Amount: String(amountInVnd * 100),
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: params.ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Mirrors VNPay NodeJS demo (routes/order.js):
    //   vnp_Params = sortObject(vnp_Params)
    //   signData   = qs.stringify(vnp_Params, { encode: false })
    //   signed     = hmac('sha512', secretKey).update(signData).digest('hex')
    //   vnp_Params['vnp_SecureHash'] = signed
    //   vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false })
    const sorted = this.sortObject(vnpParams);
    const signData = this.entriesToString(sorted);
    const secureHash = crypto
      .createHmac("sha512", this.hashSecret)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    sorted["vnp_SecureHash"] = secureHash;
    return `${this.vnpayUrl}?${this.entriesToString(sorted)}`;
  }

  /**
   * Mirrors VNPay demo sortObject():
   *   for key in obj: str.push(encodeURIComponent(key))
   *   str.sort()
   *   sorted[str[i]] = encodeURIComponent(obj[str[i]]).replace(/%20/g, '+')
   *
   * Keys:   sorted by their encodeURIComponent form (same as raw for vnp_* names)
   * Values: encodeURIComponent, space→'+'
   */
  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const encodedKeys = Object.keys(obj)
      .map((k) => encodeURIComponent(k))
      .sort();
    for (const encKey of encodedKeys) {
      const rawKey = decodeURIComponent(encKey);
      sorted[encKey] = encodeURIComponent(obj[rawKey]).replace(/%20/g, "+");
    }
    return sorted;
  }

  /**
   * Mirrors: qs.stringify(sortedObj, { encode: false })
   * Values already encoded by sortObject — stringify as-is.
   */
  private entriesToString(obj: Record<string, string>): string {
    return Object.entries(obj)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
  }

  /** Sort + encode params, then stringify. Used for both sign creation and verification. */
  private buildSignData(params: Record<string, string>): string {
    return this.entriesToString(this.sortObject(params));
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
      `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
    );
  }
}
