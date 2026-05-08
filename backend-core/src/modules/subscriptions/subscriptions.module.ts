import { Module } from "@nestjs/common";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionGuard } from "./guards/subscription.guard";
import { UsageQuotaGuard } from "./guards/usage-quota.guard";
import { MockPaymentProvider } from "./providers/mock-payment.provider";
import { VnpayPaymentProvider } from "./providers/vnpay-payment.provider";
import { SubscriptionsCronService } from "./subscriptions.cron";
import { NotificationsModule } from "../notifications/notifications.module";

/**
 * Resolve payment provider class based on PAYMENT_PROVIDER env var.
 * Default: MockPaymentProvider (safe for dev/thesis demo).
 */
function resolvePaymentProvider() {
  const provider = process.env.PAYMENT_PROVIDER?.toLowerCase();

  switch (provider) {
    case "vnpay":
      return VnpayPaymentProvider;
    default:
      return MockPaymentProvider;
  }
}

@Module({
  imports: [NotificationsModule],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsCronService,
    SubscriptionGuard,
    UsageQuotaGuard,
    // Payment provider — selected via PAYMENT_PROVIDER env var
    {
      provide: "PAYMENT_PROVIDER",
      useClass: resolvePaymentProvider(),
    },
  ],
  exports: [SubscriptionsService, SubscriptionGuard, UsageQuotaGuard],
})
export class SubscriptionsModule {}
