import { Injectable, Logger } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  PaymentProviderInterface,
  CheckoutResult,
  PaymentVerification,
} from "./payment-provider.interface";

/**
 * Mock payment provider for thesis demo.
 * Simulates payment flow — all transactions auto-succeed.
 * No real money is processed.
 */
@Injectable()
export class MockPaymentProvider implements PaymentProviderInterface {
  private readonly logger = new Logger(MockPaymentProvider.name);

  // In-memory store of pending checkouts (would be Redis/DB in production)
  private pendingSessions = new Map<string, {
    userId: string;
    amount: number;
    currency: string;
    planName: string;
  }>();

  async createCheckout(params: {
    userId: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    interval: string;
  }): Promise<CheckoutResult> {
    const sessionId = `mock_session_${uuidv4()}`;
    const providerSubId = `mock_sub_${uuidv4()}`;

    this.pendingSessions.set(sessionId, {
      userId: params.userId,
      amount: params.amount,
      currency: params.currency,
      planName: params.planName,
    });

    this.logger.log(
      `[MOCK] Checkout created: ${sessionId} for ${params.planName} ($${(params.amount / 100).toFixed(2)}/${params.interval})`,
    );

    // Mock auto-completes immediately (no redirect needed)
    return {
      sessionId,
      providerSubId,
      status: "completed",
    };
  }

  async verifyPayment(
    sessionId: string,
    providerParams?: Record<string, string>,
  ): Promise<PaymentVerification> {
    const session = this.pendingSessions.get(sessionId);

    if (!session) {
      return {
        success: false,
        providerPayId: "",
        amount: 0,
        currency: "USD",
      };
    }

    const providerPayId = `mock_pay_${uuidv4()}`;

    this.logger.log(
      `[MOCK] Payment verified: ${providerPayId} for $${(session.amount / 100).toFixed(2)}`,
    );

    // Clean up
    this.pendingSessions.delete(sessionId);

    return {
      success: true,
      providerPayId,
      amount: session.amount,
      currency: session.currency,
    };
  }

  async cancelSubscription(providerSubId: string): Promise<{ success: boolean }> {
    this.logger.log(`[MOCK] Subscription canceled: ${providerSubId}`);
    return { success: true };
  }

  getSessionData(sessionId: string) {
    const session = this.pendingSessions.get(sessionId);
    if (!session) return null;
    return {
      userId: session.userId,
      planId: "",
      amount: session.amount,
      currency: session.currency,
      planName: session.planName,
      providerSubId: "",
    };
  }
}
