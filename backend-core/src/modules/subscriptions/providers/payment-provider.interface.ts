/**
 * Abstraction for payment processing.
 * Implementations: MockPaymentProvider (thesis), VnpayPaymentProvider (sandbox)
 */
export interface PaymentProviderInterface {
  /**
   * Create a checkout session for a subscription plan.
   * Mock: returns status "completed" (auto-succeed).
   * VNPay: returns status "pending" with a redirectUrl.
   */
  createCheckout(params: {
    userId: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    interval: string;
  }): Promise<CheckoutResult>;

  /**
   * Verify a payment was successful.
   * Mock: always succeeds.
   * VNPay: validates vnp_SecureHash and vnp_ResponseCode from return params.
   *
   * @param sessionId - The checkout session ID (vnp_TxnRef for VNPay)
   * @param providerParams - Optional provider-specific query params (VNPay return URL params)
   */
  verifyPayment(
    sessionId: string,
    providerParams?: Record<string, string>,
  ): Promise<PaymentVerification>;

  /**
   * Cancel an active subscription.
   */
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
