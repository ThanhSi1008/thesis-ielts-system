import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsService } from "./subscriptions.service";
import { SubscriptionGuard } from "./guards/subscription.guard";
import { UsageQuotaGuard } from "./guards/usage-quota.guard";
import { MockPaymentProvider } from "./providers/mock-payment.provider";
import { VnpayPaymentProvider } from "./providers/vnpay-payment.provider";
import { SubscriptionsCronService } from "./subscriptions.cron";
import { NotificationsModule } from "../notifications/notifications.module";
import { RedisModule } from "../../common/redis/redis.module";
import { RedisService } from "../../common/redis/redis.service";

@Module({
  imports: [NotificationsModule, ConfigModule, RedisModule],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsCronService,
    SubscriptionGuard,
    UsageQuotaGuard,
    {
      provide: "PAYMENT_PROVIDER",
      useFactory: (config: ConfigService, redis: RedisService) => {
        const provider = config.get<string>("PAYMENT_PROVIDER")?.toLowerCase();
        if (provider === "vnpay") {
          return new VnpayPaymentProvider(redis);
        }
        return new MockPaymentProvider();
      },
      inject: [ConfigService, RedisService],
    },
  ],
  exports: [SubscriptionsService, SubscriptionGuard, UsageQuotaGuard],
})
export class SubscriptionsModule {}
