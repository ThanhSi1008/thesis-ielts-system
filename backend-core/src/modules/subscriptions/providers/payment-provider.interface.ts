/**
 * Abstraction for payment processing.
 * Implementations: MockPaymentProvider (thesis), VnpayPaymentProvider (sandbox)
 */
export interface PaymentProviderInterface {
  createCheckout(params: {
    userId: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    interval: string;
    ipAddr?: string;
  }): Promise<CheckoutResult>;

  verifyPayment(
    sessionId: string,
    providerParams?: Record<string, string>,
  ): Promise<PaymentVerification>;

  cancelSubscription(providerSubId: string): Promise<{ success: boolean }>;

  /**
   * Get stored session data for a pending checkout.
   * Returns null if session not found or already processed.
   */
  getSessionData?(sessionId: string): Promise<{
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    planName: string;
    providerSubId: string;
  } | null>;

  /**
   * Verify only the secure hash from VNPay return/IPN params.
   * Used by the IPN handler to return proper RspCode before doing DB work.
   */
  verifyHash?(params: Record<string, string>): boolean;
}

export interface CheckoutResult {
  sessionId: string;
  providerSubId: string;
  redirectUrl?: string;
  status: "pending" | "completed";
}

export interface PaymentVerification {
  success: boolean;
  providerPayId: string;
  amount: number;
  currency: string;
}
