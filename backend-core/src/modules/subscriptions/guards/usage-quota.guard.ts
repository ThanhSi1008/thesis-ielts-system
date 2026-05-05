import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SubscriptionsService } from "../subscriptions.service";
import { USAGE_QUOTA_KEY, QuotaMetadata } from "../decorators/requires-quota.decorator";
import { QuotaFeature, DAILY_QUOTA_FEATURES, DailyQuotaFeature } from "../constants/feature-limits";

@Injectable()
export class UsageQuotaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const quota = this.reflector.getAllAndOverride<QuotaMetadata>(
      USAGE_QUOTA_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No quota requirement → allow
    if (!quota) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException("Authentication required");
    }

    let allowed = false;
    let isDaily = false;

    if (DAILY_QUOTA_FEATURES.includes(quota.feature as any)) {
      isDaily = true;
      const result = await this.subscriptionsService.checkDailyUsage(userId, quota.feature);
      allowed = result.allowed;
    } else {
      allowed = await this.subscriptionsService.incrementUsage(
        userId,
        quota.feature as QuotaFeature,
      );
    }

    if (!allowed) {
      const sub = await this.subscriptionsService.getOrCreateSubscription(userId);
      throw new ForbiddenException({
        statusCode: 403,
        error: "QUOTA_EXCEEDED",
        message: `You've reached your ${quota.feature.replace(/_/g, " ").toLowerCase()} limit for ${isDaily ? "today" : "this month"}`,
        feature: quota.feature,
        currentTier: sub.tier,
        upgradeUrl: "/pricing",
      });
    }

    return true;
  }
}
