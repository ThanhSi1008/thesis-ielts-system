import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { TIER_LIMITS, QUOTA_FEATURES, DAILY_QUOTA_FEATURES, TierKey, QuotaFeature } from "./constants/feature-limits";

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // ==================== QUERIES ====================

  /**
   * Get or create subscription for user. Every user has a subscription row.
   */
  async getOrCreateSubscription(userId: string) {
    let sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub) {
      sub = await this.prisma.subscription.create({
        data: { userId, tier: "FREE", status: "ACTIVE" },
      });
    }

    // Check if trial has expired
    if (sub.status === "TRIALING" && sub.trialEndsAt && new Date() > sub.trialEndsAt) {
      sub = await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { tier: "FREE", status: "EXPIRED", trialEndsAt: null },
      });
      this.logger.log(`Trial expired for user ${userId}, downgraded to FREE`);
    }

    // Check if subscription period has ended
    if (sub.status === "ACTIVE" && sub.currentPeriodEnd && new Date() > sub.currentPeriodEnd) {
      sub = await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { tier: "FREE", status: "EXPIRED" },
      });
      this.logger.log(`Subscription expired for user ${userId}, downgraded to FREE`);
    }

    return sub;
  }

  /**
   * Get user's subscription with current usage stats.
   */
  async getMySubscription(userId: string) {
    const sub = await this.getOrCreateSubscription(userId);
    const usage = await this.getCurrentUsage(sub.id);
    const limits = TIER_LIMITS[sub.tier as TierKey];

    return {
      ...sub,
      usage,
      limits,
    };
  }

  /**
   * List all active pricing plans.
   */
  async getPlans() {
    return this.prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }],
    });
  }

  // ==================== USAGE TRACKING ====================

  /**
   * Get current period usage for a subscription.
   */
  async getCurrentUsage(subscriptionId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const records = await this.prisma.usageRecord.findMany({
      where: {
        subscriptionId,
        periodStart: { gte: periodStart },
      },
    });

    const usage: Record<string, { used: number; limit: number }> = {};

    for (const feature of QUOTA_FEATURES) {
      const record = records.find((r) => r.feature === feature);
      const sub = await this.prisma.subscription.findUnique({
        where: { id: subscriptionId },
        select: { tier: true },
      });
      const limit = TIER_LIMITS[(sub?.tier ?? "FREE") as TierKey][feature];

      usage[feature] = {
        used: record?.count ?? 0,
        limit: limit === Infinity ? -1 : (limit as number), // -1 = unlimited
      };
    }

    return usage;
  }

  /**
   * Increment usage for a quota-tracked feature.
   * Returns true if usage is within limits, false if quota exceeded.
   */
  async incrementUsage(userId: string, feature: QuotaFeature): Promise<boolean> {
    const sub = await this.getOrCreateSubscription(userId);
    const limit = TIER_LIMITS[sub.tier as TierKey][feature];

    // Unlimited
    if (limit === Infinity) return true;

    // Blocked (0 limit)
    if (limit === 0) return false;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const record = await this.prisma.usageRecord.upsert({
      where: {
        subscriptionId_feature_periodStart: {
          subscriptionId: sub.id,
          feature,
          periodStart,
        },
      },
      update: { count: { increment: 1 } },
      create: {
        subscriptionId: sub.id,
        feature,
        count: 1,
        periodStart,
        periodEnd,
      },
    });

    if (record.count > (limit as number)) {
      // Rollback the increment
      await this.prisma.usageRecord.update({
        where: { id: record.id },
        data: { count: { decrement: 1 } },
      });
      return false;
    }

    // Notify at 80% usage
    const percentUsed = record.count / (limit as number);
    if (percentUsed >= 0.8 && percentUsed < 1.0) {
      await this.notifications.create({
        userId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "⚠️ Usage Approaching Limit",
        body: `You've used ${record.count}/${limit} ${feature.replace(/_/g, " ").toLowerCase()} this month.`,
        icon: "⚠️",
        link: "/pricing",
      });
    }

    return true;
  }

  /**
   * Check daily usage (e.g., pronunciation attempts).
   */
  async checkDailyUsage(userId: string, feature: string): Promise<{ allowed: boolean; used: number; limit: number }> {
    const sub = await this.getOrCreateSubscription(userId);
    const tierLimits = TIER_LIMITS[sub.tier as TierKey];
    const limit = (tierLimits as Record<string, unknown>)[feature];

    if (limit === Infinity || limit === true) {
      return { allowed: true, used: 0, limit: -1 };
    }

    // Count today's usage from the relevant table
    // For pronunciation: count PronunciationAttempt records created today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let used = 0;
    if (feature === "PRONUNCIATION_ATTEMPT") {
      used = await this.prisma.pronunciationAttempt.count({
        where: {
          userId,
          createdAt: { gte: startOfDay },
        },
      });
    }

    return {
      allowed: used < (limit as number),
      used,
      limit: limit as number,
    };
  }

  /**
   * Check if user's tier allows access to a feature (boolean check).
   */
  async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const sub = await this.getOrCreateSubscription(userId);
    const tierLimits = TIER_LIMITS[sub.tier as TierKey];
    const value = (tierLimits as Record<string, unknown>)[feature];

    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0 || value === Infinity;
    return true;
  }

  /**
   * Get user's effective tier (considering trial status).
   */
  async getEffectiveTier(userId: string): Promise<TierKey> {
    const sub = await this.getOrCreateSubscription(userId);
    return sub.tier as TierKey;
  }

  // ==================== ADMIN ====================

  /**
   * Admin grants subscription to a user.
   */
  async adminGrant(userId: string, tier: string, durationDays: number = 30) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("User not found");

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + durationDays);

    const sub = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        tier: tier as "PREMIUM" | "PRO",
        status: "ACTIVE",
        provider: "MANUAL",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      create: {
        userId,
        tier: tier as "PREMIUM" | "PRO",
        status: "ACTIVE",
        provider: "MANUAL",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    await this.notifications.create({
      userId,
      type: "SYSTEM_ANNOUNCEMENT",
      title: `🎉 ${tier} Subscription Activated!`,
      body: `You now have ${tier} access for ${durationDays} days. Enjoy!`,
      icon: tier === "PRO" ? "💎" : "⭐",
      link: "/profile",
    });

    return sub;
  }
}
