import { Module } from "@nestjs/common";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionGuard } from "./guards/subscription.guard";
import { UsageQuotaGuard } from "./guards/usage-quota.guard";
import { MockPaymentProvider } from "./providers/mock-payment.provider";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [NotificationsModule],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionGuard,
    UsageQuotaGuard,
    // Payment provider — swap MockPaymentProvider with StripePaymentProvider in production
    {
      provide: "PAYMENT_PROVIDER",
      useClass: MockPaymentProvider,
    },
  ],
  exports: [SubscriptionsService, SubscriptionGuard, UsageQuotaGuard],
})
export class SubscriptionsModule {}
