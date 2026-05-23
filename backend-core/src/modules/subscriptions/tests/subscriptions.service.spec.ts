/**
 * TC_SUB — Subscriptions (VNPay + Business Logic)
 * File 2: Unit tests — SubscriptionsService (no HTTP layer)
 *
 * Injects the real SubscriptionsService via NestJS TestingModule;
 * PrismaService, NotificationsService, and PAYMENT_PROVIDER are mocked.
 *
 * Notes on divergence from spec:
 *   • TC_SUB_10/11 use feature 'AI_WRITING_GRADING' (a valid QuotaFeature).
 *     'PRONUNCIATION_ATTEMPT' is a DailyQuotaFeature tracked via
 *     checkDailyUsage(), not incrementUsage().
 *   • incrementUsage() returns boolean (true = within quota, false = exceeded).
 *     It does NOT throw ForbiddenException; the guard layer (UsageQuotaGuard)
 *     converts the false return into a 403 response.
 *   • cancelSubscription sets status='CANCELED' immediately; access continues
 *     because currentPeriodEnd is still in the future.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';

import { SubscriptionsService } from '../subscriptions.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('TC_SUB — Subscriptions (VNPay + Business Logic)', () => {
  describe('SubscriptionsService — unit tests', () => {
    let service: SubscriptionsService;
    let prismaMock: any;
    let mockNotifications: any;
    let mockPaymentProvider: any;

    // ── Shared subscription fixtures ──────────────────────────────────
    const makeFreeSub = (overrides: Record<string, unknown> = {}) => ({
      id: 'sub-free-001',
      userId: 'user-svc-test',
      tier: 'FREE',
      status: 'ACTIVE',
      trialUsed: false,
      trialEndsAt: null,
      currentPeriodEnd: null,
      currentPeriodStart: null,
      canceledAt: null,
      providerSubId: null,
      provider: 'MOCK',
      ...overrides,
    });

    const makePremiumSub = (overrides: Record<string, unknown> = {}) => ({
      id: 'sub-premium-001',
      userId: 'user-svc-test',
      tier: 'PREMIUM',
      status: 'ACTIVE',
      trialUsed: true,
      trialEndsAt: null,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      currentPeriodStart: new Date(),
      canceledAt: null,
      providerSubId: 'vnp_sub_svc',
      provider: 'VNPAY',
      ...overrides,
    });

    beforeAll(async () => {
      prismaMock = {
        subscription: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          upsert: jest.fn(),
        },
        usageRecord: {
          findMany: jest.fn().mockResolvedValue([]),
          upsert: jest.fn(),
          update: jest.fn(),
        },
        foundationPronunciationAttempt: {
          count: jest.fn().mockResolvedValue(0),
        },
        pricingPlan: { findMany: jest.fn().mockResolvedValue([]) },
        payment: {
          findMany: jest.fn().mockResolvedValue([]),
          create: jest.fn(),
          findFirst: jest.fn(),
          aggregate: jest.fn(),
        },
        user: { findUnique: jest.fn() },
      };

      mockNotifications = { create: jest.fn().mockResolvedValue(undefined) };

      mockPaymentProvider = {
        verifyHash: jest.fn(),
        getSessionData: jest.fn(),
        verifyPayment: jest.fn(),
        createCheckout: jest.fn(),
        cancelSubscription: jest.fn().mockResolvedValue({ success: true }),
      };

      const moduleRef: TestingModule = await Test.createTestingModule({
        providers: [
          SubscriptionsService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: NotificationsService, useValue: mockNotifications },
          { provide: 'PAYMENT_PROVIDER', useValue: mockPaymentProvider },
        ],
      }).compile();

      service = moduleRef.get(SubscriptionsService);
    });

    beforeEach(() => jest.clearAllMocks());

    // ── TC_SUB_06: startTrial — first trial ───────────────────────────
    it('TC_SUB_06: startTrial() — user chưa trial → tạo subscription TRIALING, endDate ≈ now + 7 ngày', async () => {
      const freeSub = makeFreeSub();
      prismaMock.subscription.findUnique.mockResolvedValue(freeSub);

      const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const updatedSub = makeFreeSub({
        tier: 'PREMIUM',
        status: 'TRIALING',
        trialUsed: true,
        trialEndsAt: trialEnd,
      });
      prismaMock.subscription.update.mockResolvedValue(updatedSub);

      const result = await service.startTrial('user-svc-test');

      // Returns trial info
      expect(result.subscription.status).toBe('TRIALING');
      expect(result.subscription.tier).toBe('PREMIUM');
      expect(result.subscription.trialUsed).toBe(true);

      // trialEndsAt ≈ now + 7 days (within 5-second tolerance)
      const now = new Date();
      const expectedEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      expect(result.trialEndsAt.getTime()).toBeGreaterThan(expectedEnd.getTime() - 5_000);
      expect(result.trialEndsAt.getTime()).toBeLessThan(expectedEnd.getTime() + 5_000);

      // Prisma update called with correct tier, status, and trialUsed flag
      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tier: 'PREMIUM',
            status: 'TRIALING',
            trialUsed: true,
          }),
        }),
      );

      // User notified about trial start
      expect(mockNotifications.create).toHaveBeenCalled();
    });

    // ── TC_SUB_07: startTrial — already used ──────────────────────────
    it('TC_SUB_07: startTrial() — trialUsed=true → throw BadRequestException "already used"', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(
        makeFreeSub({ trialUsed: true }),
      );

      await expect(service.startTrial('user-svc-test')).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.startTrial('user-svc-test')).rejects.toThrow(
        /already used/i,
      );

      // Subscription must NOT be modified
      expect(prismaMock.subscription.update).not.toHaveBeenCalled();
    });

    // ── TC_SUB_08: cancel — FREE plan ─────────────────────────────────
    it('TC_SUB_08: cancelSubscription() — user FREE → throw BadRequestException', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makeFreeSub());

      await expect(
        service.cancelSubscription('user-svc-test', 'no reason'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.cancelSubscription('user-svc-test', 'no reason'),
      ).rejects.toThrow(/don't have an active subscription/i);

      expect(prismaMock.subscription.update).not.toHaveBeenCalled();
    });

    // ── TC_SUB_09: cancel — PREMIUM plan ─────────────────────────────
    it('TC_SUB_09: cancelSubscription() — user PREMIUM → status CANCELED, paymentProvider.cancelSubscription gọi', async () => {
      const premiumSub = makePremiumSub();
      prismaMock.subscription.findUnique.mockResolvedValue(premiumSub);

      const canceledSub = { ...premiumSub, status: 'CANCELED', canceledAt: new Date() };
      prismaMock.subscription.update.mockResolvedValue(canceledSub);

      const result = await service.cancelSubscription('user-svc-test', 'cost');

      // Subscription status immediately set to CANCELED
      expect(prismaMock.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-premium-001' },
          data: expect.objectContaining({
            status: 'CANCELED',
            canceledAt: expect.any(Date),
          }),
        }),
      );

      // Payment provider notified to cancel recurring billing
      expect(mockPaymentProvider.cancelSubscription).toHaveBeenCalledWith(
        'vnp_sub_svc',
      );

      // User notified; access continues until currentPeriodEnd
      expect(result.accessUntil).toEqual(premiumSub.currentPeriodEnd);
      expect(mockNotifications.create).toHaveBeenCalled();
    });

    // ── TC_SUB_10: incrementUsage — within quota ──────────────────────
    // Note: uses QuotaFeature 'AI_WRITING_GRADING' (PREMIUM limit = 10/month).
    // 'PRONUNCIATION_ATTEMPT' is a DailyQuotaFeature handled by checkDailyUsage().
    it('TC_SUB_10: incrementUsage(AI_WRITING_GRADING) — còn quota → trả về true, count tăng', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makePremiumSub());
      // Usage record with count well within the 10/month PREMIUM limit
      prismaMock.usageRecord.upsert.mockResolvedValue({ id: 'rec-001', count: 5 });

      const allowed = await service.incrementUsage('user-svc-test', 'AI_WRITING_GRADING');

      expect(allowed).toBe(true);
      expect(prismaMock.usageRecord.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: { count: { increment: 1 } },
        }),
      );
      // Count (5) < limit (10) — no rollback
      expect(prismaMock.usageRecord.update).not.toHaveBeenCalled();
    });

    // ── TC_SUB_11: incrementUsage — quota exceeded ────────────────────
    // incrementUsage() returns false (not throw) when quota is exceeded.
    // The HTTP 403 is raised by UsageQuotaGuard which reads this boolean.
    it('TC_SUB_11: incrementUsage(AI_WRITING_GRADING) — vượt quota → trả về false, count bị rollback', async () => {
      prismaMock.subscription.findUnique.mockResolvedValue(makePremiumSub());
      // Upsert returns count=11 which exceeds PREMIUM limit of 10
      prismaMock.usageRecord.upsert.mockResolvedValue({ id: 'rec-002', count: 11 });
      prismaMock.usageRecord.update.mockResolvedValue({ id: 'rec-002', count: 10 });

      const allowed = await service.incrementUsage('user-svc-test', 'AI_WRITING_GRADING');

      expect(allowed).toBe(false);

      // Optimistic increment must be rolled back to avoid drift
      expect(prismaMock.usageRecord.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rec-002' },
          data: { count: { decrement: 1 } },
        }),
      );
    });
  });
});
