/**
 * Abstraction for payment processing.
 * Implementations: MockPaymentProvider (thesis), StripePaymentProvider (production)
 */
export interface PaymentProviderInterface {
  /**
   * Create a checkout session for a subscription plan.
   * Returns a checkout ieltsIntensiveResult with session ID and (optional) redirect URL.
   */
  createCheckout(params: {
    userId: string;
    planId: string;
    planName: string;
    amount: number; // cents
    currency: string;
    interval: string; // "month" | "year"
  }): Promise<CheckoutResult>;

  /**
   * Verify a payment was successful (called after mock confirmation or webhook).
   */
  verifyPayment(sessionId: string): Promise<PaymentVerification>;

  /**
   * Cancel an active subscription.
   */
  cancelSubscription(providerSubId: string): Promise<{ success: boolean }>;
}

export interface CheckoutResult {
  sessionId: string;       // Unique checkout session identifier
  providerSubId: string;   // Provider's subscription ID
  redirectUrl?: string;    // URL to redirect user to (Stripe checkout page, etc.)
  status: "pending" | "completed"; // Mock can return "completed" immediately
}

export interface PaymentVerification {
  success: boolean;
  providerPayId: string;   // Transaction/payment ID
  amount: number;
  currency: string;
}
