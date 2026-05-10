import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SubscriptionsService } from "../subscriptions.service";
import { SUBSCRIPTION_TIER_KEY } from "../decorators/requires-tier.decorator";

const TIER_HIERARCHY: Record<string, number> = {
  FREE: 0,
  PREMIUM: 1,
  PRO: 2,
};

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredTier = this.reflector.getAllAndOverride<string>(
      SUBSCRIPTION_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No tier requirement → allow
    if (!requiredTier) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException("Authentication required");
    }

    const effectiveTier = await this.subscriptionsService.getEffectiveTier(userId);
    const userTierLevel = TIER_HIERARCHY[effectiveTier] ?? 0;
    const requiredTierLevel = TIER_HIERARCHY[requiredTier] ?? 0;

    if (userTierLevel < requiredTierLevel) {
      throw new ForbiddenException({
        statusCode: 403,
        error: "SUBSCRIPTION_REQUIRED",
        message: `This feature requires a ${requiredTier} subscription`,
        requiredTier,
        currentTier: effectiveTier,
        upgradeUrl: "/pricing",
      });
    }

    return true;
  }
}
