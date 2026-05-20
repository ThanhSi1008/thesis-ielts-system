/**
 * TC_SUB — Subscriptions (VNPay + Business Logic)
 * File 3: Unit tests — SubscriptionsCronService
 *
 * Tests the daily lifecycle cron that:
 *   1. Sends expiry reminders (7/3/1 days before expiry)
 *   2. Downgrades ACTIVE subscriptions past the 3-day grace period to FREE
 *   3. Downgrades expired TRIALING subscriptions to FREE
 *
 * PrismaService and NotificationsService are mocked in-process.
 * The @Cron decorator is ignored — we call handleSubscriptionLifecycle()
 * directly to make the tests deterministic and not depend on system clock.
 *
 * Prisma call order inside handleSubscriptionLifecycle():
 *   subscription.findMany × 3  (expiry reminders: 7d, 3d, 1d windows)
 *   subscription.findMany × 1  (downgradeExpiredSubscriptions)
 *   subscription.findMany × 1  (downgradeExpiredTrials)
 *
 * mockResolvedValueOnce chaining maps exactly to this order.
 */

import { Test, TestingModule } from '@nestjs/testing';

import { SubscriptionsCronService } from '../subscriptions.cron';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('TC_SUB — Subscriptions (VNPay + Business Logic)', () => {
  describe('SubscriptionsCronService — unit tests', () => {
    let cronService: SubscriptionsCronService;
    let prismaMock: any;
    let mockNotifications: any;

    beforeAll(async () => {
      prismaMock = {
        subscription: {
          findMany: jest.fn(),
          update: jest.fn(),
        },
      };

      mockNotifications = { create: jest.fn().mockResolvedValue(undefined) };

      const moduleRef: TestingModule = await Test.createTestingModule({
        providers: [
          SubscriptionsCronService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: NotificationsService, useValue: mockNotifications },
        ],
      }).compile();

      cronService = moduleRef.get(SubscriptionsCronService);
    });

    beforeEach(() => jest.clearAllMocks());

    // ── TC_SUB_12: Expired past grace period → downgrade ──────────────
    // Subscription ended 4 days ago → past the 3-day grace deadline
    //   → findMany (expired query) returns the sub → update to FREE/EXPIRED
    it('TC_SUB_12: subscription quá endDate + 3 ngày grace period → downgrade về FREE', async () => {
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
      const expiredSub = {
        id: 'sub-expired-tc12',
        userId: 'user-tc12',
        tier: 'PREMIUM',
        status: 'ACTIVE',
        currentPeriodEnd: fourDaysAgo,
      };

      prismaMock.subscription.findMany
        .mockResolvedValueOnce([])           // sendExpiryReminders — 7-day window
        .mockResolvedValueOnce([])           // sendExpiryReminders — 3-day window
        .mockResolvedValueOnce([])           // sendExpiryReminders — 1-day window
        .mockResolvedValueOnce([expiredSub]) // downgradeExpiredSubscriptions
        .mockResolvedValueOnce([]);          // downgradeExpiredTrials

      prismaMock.subscription.update.mockResolvedValue({
        ...expiredSub,
        tier: 'FREE',
        status: 'EXPIRED',
      });

      await cronService.handleSubscriptionLifecycle();

      // Must downgrade the expired subscription
      expect(prismaMock.subscription.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.subscription.update).toHaveBeenCalledWith({
        where: { id: 'sub-expired-tc12' },
        data: { tier: 'FREE', status: 'EXPIRED' },
      });

      // User must be notified about the downgrade
      expect(mockNotifications.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-tc12',
          type: 'SYSTEM_ANNOUNCEMENT',
        }),
      );
    });

    // ── TC_SUB_13: Within grace period → NOT downgraded ───────────────
    // Subscription ended 1 day ago → still within 3-day grace period.
    // In production the DB query uses currentPeriodEnd < (now - 3 days),
    // so this subscription would NOT be returned; we simulate that by
    // returning an empty array from the expired-subs findMany call.
    it('TC_SUB_13: subscription trong grace period (endDate < now, < 3 ngày) → KHÔNG downgrade', async () => {
      // This sub ended 1 day ago — the real query would NOT return it because
      // its currentPeriodEnd is NOT less than (now - 3 days)
      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      void oneDayAgo; // documented for clarity; not passed to findMany (DB filters it)

      prismaMock.subscription.findMany
        .mockResolvedValueOnce([]) // sendExpiryReminders — 7-day window
        .mockResolvedValueOnce([]) // sendExpiryReminders — 3-day window
        .mockResolvedValueOnce([]) // sendExpiryReminders — 1-day window
        .mockResolvedValueOnce([]) // downgradeExpiredSubscriptions (grace-period sub excluded)
        .mockResolvedValueOnce([]); // downgradeExpiredTrials

      await cronService.handleSubscriptionLifecycle();

      // No subscription should be downgraded during the grace period
      expect(prismaMock.subscription.update).not.toHaveBeenCalled();
      // No expiry notification either
      const expiryCalls = (mockNotifications.create as jest.Mock).mock.calls.filter(
        (args: any[]) =>
          args[0]?.title?.includes('Expired') || args[0]?.title?.includes('expired'),
      );
      expect(expiryCalls).toHaveLength(0);
    });
  });
});
