/**
 * TC_STREAK — StreakService unit tests
 *
 * Strategy: pure service-level isolation.
 *   - PrismaService → full jest mock
 *   - NotificationsService → jest mock (spy on notifyStreakMilestone)
 *   - GamificationService → jest mock (spy on onEvent)
 *   - jest.useFakeTimers() pins "now" for all date arithmetic tests
 *
 * The service normalises dates to start-of-day in local time.
 * We derive "today", "yesterday", and "two days ago" relative to FIXED_NOW
 * using the same new Date(Y, M, D) pattern the service uses.
 *
 * TC_STREAK_01: First activity (no lastActiveDate) → currentStreak=1, lastActiveDate=today
 * TC_STREAK_02: Consecutive day → currentStreak incremented
 * TC_STREAK_03: Missed one day → currentStreak resets to 1
 * TC_STREAK_04: Same-day call → idempotent (no-op, currentStreak unchanged)
 * TC_STREAK_05: Streak reaches 7 → GamificationService.onEvent called with XM_ON_FIRE
 */

import { Test, TestingModule } from '@nestjs/testing';
import { StreakService } from '../streak.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { GamificationService } from '../../gamification/gamification.service';

// ─────────────────────────────────────────────────────────────────────────────
// Shared time fixtures
// ─────────────────────────────────────────────────────────────────────────────

const FIXED_NOW = new Date('2025-06-15T14:30:00.000Z'); // arbitrary fixed instant

// Start-of-day equivalents (mirrors service logic: new Date(Y, M, D))
const TODAY = new Date(
  FIXED_NOW.getFullYear(),
  FIXED_NOW.getMonth(),
  FIXED_NOW.getDate(),
);
const YESTERDAY = new Date(TODAY.getTime() - 24 * 60 * 60 * 1000);
const TWO_DAYS_AGO = new Date(TODAY.getTime() - 2 * 24 * 60 * 60 * 1000);

const USER_ID = 'user-streak-001';

// ─────────────────────────────────────────────────────────────────────────────
// Fixture helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildProfile(overrides: Partial<{
  id: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date | null;
}> = {}) {
  return {
    id: 'profile-streak-001',
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock factories
// ─────────────────────────────────────────────────────────────────────────────

function makePrismaMock() {
  return {
    ieltsProfile: {
      findUnique: jest.fn(),
      update: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({ id: 'profile-streak-001', ...data }),
      ),
    },
  };
}

function makeNotificationsMock() {
  return {
    create: jest.fn().mockResolvedValue({}),
    notifyStreakMilestone: jest.fn().mockResolvedValue({}),
  };
}

function makeGamificationMock() {
  return {
    onEvent: jest.fn().mockResolvedValue(undefined),
  };
}

async function buildService(
  prisma: ReturnType<typeof makePrismaMock>,
  notifications: ReturnType<typeof makeNotificationsMock>,
  gamification: ReturnType<typeof makeGamificationMock>,
) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      StreakService,
      { provide: PrismaService, useValue: prisma },
      { provide: NotificationsService, useValue: notifications },
      { provide: GamificationService, useValue: gamification },
    ],
  }).compile();

  return module.get<StreakService>(StreakService);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('TC_STREAK', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('recordActivity', () => {
    describe('TC_STREAK_01 — first activity (no lastActiveDate) → streak=1', () => {
      it('sets currentStreak to 1 and lastActiveDate to today', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ lastActiveDate: null }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        expect(prisma.ieltsProfile.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              currentStreak: 1,
              lastActiveDate: TODAY,
            }),
          }),
        );
      });

      it('sets longestStreak to at least 1 on first activity', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ lastActiveDate: null, longestStreak: 0 }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        expect(prisma.ieltsProfile.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ longestStreak: 1 }),
          }),
        );
      });
    });

    describe('TC_STREAK_02 — consecutive day → streak incremented', () => {
      it('increments currentStreak by 1 when lastActiveDate was yesterday', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ currentStreak: 3, longestStreak: 3, lastActiveDate: YESTERDAY }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        expect(prisma.ieltsProfile.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ currentStreak: 4 }),
          }),
        );
      });

      it('updates longestStreak when new streak exceeds previous longest', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ currentStreak: 5, longestStreak: 5, lastActiveDate: YESTERDAY }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        expect(prisma.ieltsProfile.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ longestStreak: 6 }),
          }),
        );
      });
    });

    describe('TC_STREAK_03 — gap > 1 day → streak resets to 1', () => {
      it('resets currentStreak to 1 when lastActiveDate was 2+ days ago', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ currentStreak: 10, longestStreak: 10, lastActiveDate: TWO_DAYS_AGO }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        expect(prisma.ieltsProfile.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ currentStreak: 1 }),
          }),
        );
      });

      it('does not decrement longestStreak on reset', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ currentStreak: 10, longestStreak: 10, lastActiveDate: TWO_DAYS_AGO }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        // longestStreak should NOT be passed in the reset update (service omits it)
        const updateCall = prisma.ieltsProfile.update.mock.calls[0][0];
        expect(updateCall.data.longestStreak).toBeUndefined();
      });
    });

    describe('TC_STREAK_04 — same-day call → idempotent (no update)', () => {
      it('returns profile without calling update when lastActiveDate is today', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        const profile = buildProfile({ currentStreak: 5, lastActiveDate: TODAY });
        prisma.ieltsProfile.findUnique.mockResolvedValue(profile);

        const service = await buildService(prisma, notifications, gamification);
        const result = await service.recordActivity(USER_ID);

        expect(prisma.ieltsProfile.update).not.toHaveBeenCalled();
        expect(result).toEqual(profile);
      });

      it('does not fire gamification events on same-day no-op', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ currentStreak: 5, lastActiveDate: TODAY }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        expect(gamification.onEvent).not.toHaveBeenCalled();
      });
    });

    describe('TC_STREAK_05 — streak reaches 7 → GamificationService.onEvent with XM_ON_FIRE', () => {
      it('calls onEvent with achievementKeys containing XM_ON_FIRE when streak hits 7', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        // streak is currently 6, yesterday was the last activity → will become 7
        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ currentStreak: 6, longestStreak: 6, lastActiveDate: YESTERDAY }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        // onEvent is called fire-and-forget (.catch(()=>{})); await a tick to let it flush
        await Promise.resolve();

        expect(gamification.onEvent).toHaveBeenCalledWith(
          USER_ID,
          expect.objectContaining({
            achievementKeys: expect.arrayContaining(['XM_ON_FIRE']),
          }),
        );
      });

      it('sends milestone notification when streak hits 7 (STREAK_MILESTONES includes 7)', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ currentStreak: 6, longestStreak: 6, lastActiveDate: YESTERDAY }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        // Allow the fire-and-forget promises to settle
        await Promise.resolve();

        expect(notifications.notifyStreakMilestone).toHaveBeenCalledWith(USER_ID, 7);
      });

      it('passes XP proportional to new streak count (5 * newStreak)', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(
          buildProfile({ currentStreak: 6, longestStreak: 6, lastActiveDate: YESTERDAY }),
        );

        const service = await buildService(prisma, notifications, gamification);
        await service.recordActivity(USER_ID);

        await Promise.resolve();

        expect(gamification.onEvent).toHaveBeenCalledWith(
          USER_ID,
          expect.objectContaining({ xp: 5 * 7 }), // 5 * newStreak
        );
      });
    });

    describe('Edge cases', () => {
      it('returns null when profile does not exist', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockResolvedValue(null);

        const service = await buildService(prisma, notifications, gamification);
        const result = await service.recordActivity(USER_ID);

        expect(result).toBeNull();
        expect(prisma.ieltsProfile.update).not.toHaveBeenCalled();
      });

      it('returns null and does not throw when Prisma throws', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        const gamification = makeGamificationMock();

        prisma.ieltsProfile.findUnique.mockRejectedValue(new Error('DB connection lost'));

        const service = await buildService(prisma, notifications, gamification);
        const result = await service.recordActivity(USER_ID);

        expect(result).toBeNull();
      });
    });
  });

  describe('getStreak', () => {
    it('returns default values if profile does not exist', async () => {
      const prisma = makePrismaMock();
      prisma.ieltsProfile.findUnique.mockResolvedValue(null);

      const service = await buildService(prisma, makeNotificationsMock(), makeGamificationMock());
      const result = await service.getStreak(USER_ID);

      expect(result).toEqual({ currentStreak: 0, longestStreak: 0, lastActiveDate: null });
      expect(prisma.ieltsProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        select: {
          currentStreak: true,
          longestStreak: true,
          lastActiveDate: true,
        },
      });
    });

    it('returns streak unmodified if lastActiveDate is null', async () => {
      const prisma = makePrismaMock();
      prisma.ieltsProfile.findUnique.mockResolvedValue({
        currentStreak: 5,
        longestStreak: 8,
        lastActiveDate: null,
      });

      const service = await buildService(prisma, makeNotificationsMock(), makeGamificationMock());
      const result = await service.getStreak(USER_ID);

      expect(result).toEqual({ currentStreak: 5, longestStreak: 8, lastActiveDate: null });
    });

    it('returns streak unmodified if lastActiveDate is within 1 day (today)', async () => {
      const prisma = makePrismaMock();
      prisma.ieltsProfile.findUnique.mockResolvedValue({
        currentStreak: 5,
        longestStreak: 8,
        lastActiveDate: TODAY,
      });

      const service = await buildService(prisma, makeNotificationsMock(), makeGamificationMock());
      const result = await service.getStreak(USER_ID);

      expect(result).toEqual({ currentStreak: 5, longestStreak: 8, lastActiveDate: TODAY });
    });

    it('returns streak unmodified if lastActiveDate is within 1 day (yesterday)', async () => {
      const prisma = makePrismaMock();
      prisma.ieltsProfile.findUnique.mockResolvedValue({
        currentStreak: 5,
        longestStreak: 8,
        lastActiveDate: YESTERDAY,
      });

      const service = await buildService(prisma, makeNotificationsMock(), makeGamificationMock());
      const result = await service.getStreak(USER_ID);

      expect(result).toEqual({ currentStreak: 5, longestStreak: 8, lastActiveDate: YESTERDAY });
    });

    it('returns currentStreak = 0 if lastActiveDate is more than 1 day ago', async () => {
      const prisma = makePrismaMock();
      prisma.ieltsProfile.findUnique.mockResolvedValue({
        currentStreak: 5,
        longestStreak: 8,
        lastActiveDate: TWO_DAYS_AGO,
      });

      const service = await buildService(prisma, makeNotificationsMock(), makeGamificationMock());
      const result = await service.getStreak(USER_ID);

      expect(result).toEqual({ currentStreak: 0, longestStreak: 8, lastActiveDate: TWO_DAYS_AGO });
    });
  });
});
