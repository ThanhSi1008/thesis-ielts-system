import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

// ─── Constants ─────────────────────────────────────────────
const GRACE_PERIOD_DAYS = 3;
const REMINDER_DAYS = [7, 3, 1]; // Days before expiry to send reminders

@Injectable()
export class SubscriptionsCronService {
  private readonly logger = new Logger(SubscriptionsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Runs every day at 2:00 AM.
   * Checks for expiring/expired subscriptions and sends notifications.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleSubscriptionLifecycle() {
    this.logger.log("Running subscription lifecycle cron...");

    await this.sendExpiryReminders();
    await this.downgradeExpiredSubscriptions();
    await this.downgradeExpiredTrials();

    this.logger.log("Subscription lifecycle cron complete.");
  }

  /**
   * Send reminder notifications to users whose subscriptions are about to expire.
   */
  private async sendExpiryReminders() {
    const now = new Date();

    for (const daysBefore of REMINDER_DAYS) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysBefore);

      // Find subscriptions expiring on this target date (±12 hours window)
      const windowStart = new Date(targetDate);
      windowStart.setHours(0, 0, 0, 0);
      const windowEnd = new Date(targetDate);
      windowEnd.setHours(23, 59, 59, 999);

      const expiringSubs = await this.prisma.subscription.findMany({
        where: {
          status: "ACTIVE",
          tier: { in: ["PREMIUM", "PRO"] },
          currentPeriodEnd: {
            gte: windowStart,
            lte: windowEnd,
          },
        },
        select: { userId: true, tier: true, currentPeriodEnd: true },
      });

      for (const sub of expiringSubs) {
        const expiryDate = sub.currentPeriodEnd?.toLocaleDateString() ?? "soon";

        await this.notifications.create({
          userId: sub.userId,
          type: "SYSTEM_ANNOUNCEMENT",
          title:
            daysBefore === 1
              ? "⚠️ Subscription Expires Tomorrow!"
              : `📅 Subscription Expires in ${daysBefore} Days`,
          body: `Your ${sub.tier} subscription expires on ${expiryDate}. Renew now to keep your premium features.`,
          icon: daysBefore === 1 ? "⚠️" : "📅",
          link: "/pricing",
        });
      }

      if (expiringSubs.length > 0) {
        this.logger.log(
          `Sent ${daysBefore}-day expiry reminders to ${expiringSubs.length} users`,
        );
      }
    }
  }

  /**
   * Downgrade subscriptions that have expired past the grace period.
   */
  private async downgradeExpiredSubscriptions() {
    const now = new Date();
    const graceDeadline = new Date(now);
    graceDeadline.setDate(graceDeadline.getDate() - GRACE_PERIOD_DAYS);

    // Find ACTIVE subscriptions whose period ended before the grace deadline
    const expiredSubs = await this.prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        tier: { in: ["PREMIUM", "PRO"] },
        currentPeriodEnd: { lt: graceDeadline },
      },
    });

    for (const sub of expiredSubs) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          tier: "FREE",
          status: "EXPIRED",
        },
      });

      await this.notifications.create({
        userId: sub.userId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "😔 Subscription Expired",
        body: `Your ${sub.tier} subscription has expired. Upgrade again to restore your premium features.`,
        icon: "😔",
        link: "/pricing",
      });
    }

    if (expiredSubs.length > 0) {
      this.logger.log(`Downgraded ${expiredSubs.length} expired subscriptions`);
    }
  }

  /**
   * Downgrade trials that have ended.
   */
  private async downgradeExpiredTrials() {
    const now = new Date();

    const expiredTrials = await this.prisma.subscription.findMany({
      where: {
        status: "TRIALING",
        trialEndsAt: { lt: now },
      },
    });

    for (const sub of expiredTrials) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: {
          tier: "FREE",
          status: "EXPIRED",
          trialEndsAt: null,
        },
      });

      await this.notifications.create({
        userId: sub.userId,
        type: "SYSTEM_ANNOUNCEMENT",
        title: "⏰ Free Trial Ended",
        body: "Your 7-day Premium trial has ended. Upgrade to keep access to all features!",
        icon: "⏰",
        link: "/pricing",
      });
    }

    if (expiredTrials.length > 0) {
      this.logger.log(`Downgraded ${expiredTrials.length} expired trials`);
    }
  }
}
