/**
 * TC_GAMI — GamificationService unit tests
 *
 * Strategy: pure service-level isolation.
 *   - PrismaService → full jest mock object (all methods jest.fn())
 *   - NotificationsService → jest mock
 *   - No NestJS app bootstrap; service instantiated directly via Test.createTestingModule
 *
 * TC_GAMI_01: onEvent(xp=10, reason) → creates XpLog + updates IeltsProfile XP
 * TC_GAMI_02: XP causes level-up → sends Notification (ACHIEVEMENT type)
 * TC_GAMI_03: Achievement already exists → no duplicate UserAchievement created
 * TC_GAMI_04: onEvent with xp=0 → XpLog.create never called
 */

import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from '../gamification.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixtures
// ─────────────────────────────────────────────────────────────────────────────

const USER_ID = 'user-gami-001';

function buildProfile(overrides: Partial<{
  id: string; totalXp: number; level: number;
}> = {}) {
  return { id: 'profile-001', totalXp: 0, level: 0, longestStreak: 0, ...overrides };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock factories
// ─────────────────────────────────────────────────────────────────────────────

function makePrismaMock() {
  return {
    xpLog: { create: jest.fn().mockResolvedValue({}) },
    ieltsProfile: {
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
    userAchievement: {
      findFirst: jest.fn(),
      create: jest.fn().mockResolvedValue({}),
    },
    achievement: {
      findUnique: jest.fn(),
    },
  };
}

function makeNotificationsMock() {
  return { create: jest.fn().mockResolvedValue({}) };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build service under test
// ─────────────────────────────────────────────────────────────────────────────

async function buildService(prisma: ReturnType<typeof makePrismaMock>, notifications: ReturnType<typeof makeNotificationsMock>) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      GamificationService,
      { provide: PrismaService, useValue: prisma },
      { provide: NotificationsService, useValue: notifications },
    ],
  }).compile();

  return module.get<GamificationService>(GamificationService);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('TC_GAMI', () => {
  describe('onEvent', () => {
    describe('TC_GAMI_01 — xp > 0 → creates XpLog and updates profile XP', () => {
      it('creates XpLog with correct fields', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        prisma.ieltsProfile.findUnique.mockResolvedValue(buildProfile({ totalXp: 50, level: 0 }));

        const service = await buildService(prisma, notifications);
        await service.onEvent(USER_ID, { xp: 10, reason: 'IELTS_LESSON_COMPLETE' });

        expect(prisma.xpLog.create).toHaveBeenCalledTimes(1);
        expect(prisma.xpLog.create).toHaveBeenCalledWith({
          data: { userId: USER_ID, amount: 10, reason: 'IELTS_LESSON_COMPLETE' },
        });
      });

      it('updates IeltsProfile with new totalXp', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        prisma.ieltsProfile.findUnique.mockResolvedValue(buildProfile({ totalXp: 50, level: 0 }));

        const service = await buildService(prisma, notifications);
        await service.onEvent(USER_ID, { xp: 10, reason: 'IELTS_LESSON_COMPLETE' });

        expect(prisma.ieltsProfile.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ totalXp: 60 }),
          }),
        );
      });

      it('does not crash when IeltsProfile does not exist', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        prisma.ieltsProfile.findUnique.mockResolvedValue(null);

        const service = await buildService(prisma, notifications);
        // Should resolve silently (non-blocking gamification)
        await expect(service.onEvent(USER_ID, { xp: 10, reason: 'X' })).resolves.toBeUndefined();
        expect(prisma.ieltsProfile.update).not.toHaveBeenCalled();
      });
    });

    describe('TC_GAMI_02 — XP causes level-up → sends Notification', () => {
      it('sends ACHIEVEMENT notification when level increases', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        // Level 0 at 0 XP; adding 100 XP triggers level 1 (threshold = 100)
        prisma.ieltsProfile.findUnique.mockResolvedValue(buildProfile({ totalXp: 0, level: 0 }));

        const service = await buildService(prisma, notifications);
        await service.onEvent(USER_ID, { xp: 100, reason: 'TEST_LEVEL_UP' });

        expect(notifications.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: USER_ID,
            type: 'ACHIEVEMENT',
            title: expect.stringContaining('Level'),
          }),
        );
      });

      it('does not send notification when level stays the same', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        // Already at level 1 (totalXp=100); adding 10 XP keeps level 1
        prisma.ieltsProfile.findUnique.mockResolvedValue(buildProfile({ totalXp: 100, level: 1 }));

        const service = await buildService(prisma, notifications);
        await service.onEvent(USER_ID, { xp: 10, reason: 'SMALL_XP' });

        expect(notifications.create).not.toHaveBeenCalled();
      });
    });

    describe('TC_GAMI_03 — Achievement already unlocked → no duplicate created', () => {
      it('skips UserAchievement.create when achievement already earned', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        // Reaching level >= 10 triggers tryGrantAchievement('XM_DEDICATED')
        // Give enough XP: level 10 needs sum(1..10)*100 = 5500 XP
        prisma.ieltsProfile.findUnique.mockResolvedValue(buildProfile({ totalXp: 5400, level: 9 }));
        // Achievement already exists
        prisma.userAchievement.findFirst.mockResolvedValue({ id: 'ua-001' });

        const service = await buildService(prisma, notifications);
        await service.onEvent(USER_ID, { xp: 100, reason: 'LEVEL_10_TRIGGER' });

        expect(prisma.userAchievement.create).not.toHaveBeenCalled();
      });
    });

    describe('TC_GAMI_04 — xp = 0 → XpLog not created', () => {
      it('skips XpLog.create entirely', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();

        const service = await buildService(prisma, notifications);
        await service.onEvent(USER_ID, { xp: 0, reason: 'NO_XP_EVENT' });

        expect(prisma.xpLog.create).not.toHaveBeenCalled();
        expect(prisma.ieltsProfile.update).not.toHaveBeenCalled();
      });

      it('still processes achievementKeys even when xp = 0', async () => {
        const prisma = makePrismaMock();
        const notifications = makeNotificationsMock();
        prisma.userAchievement.findFirst.mockResolvedValue(null);
        prisma.achievement.findUnique.mockResolvedValue({
          id: 'ach-001', key: 'FV_FIRST_WORDS', name: 'First Words',
          description: 'desc', xpReward: 0,
        });
        // FV_FIRST_WORDS case checks foundationVocabProgress.count
        (prisma as any).foundationVocabProgress = {
          count: jest.fn().mockResolvedValue(1),
        };

        const service = await buildService(prisma, notifications);
        await service.onEvent(USER_ID, { xp: 0, reason: 'NONE', achievementKeys: ['FV_FIRST_WORDS'] });

        expect(prisma.xpLog.create).not.toHaveBeenCalled();
      });
    });
  });

  describe('tryGrantAchievement', () => {
    it('grants achievement and sends notification when not yet earned', async () => {
      const prisma = makePrismaMock();
      const notifications = makeNotificationsMock();
      prisma.userAchievement.findFirst.mockResolvedValue(null);
      prisma.achievement.findUnique.mockResolvedValue({
        id: 'ach-002', key: 'CM_FIRST_POST', name: 'First Post',
        description: 'Posted for the first time', xpReward: 0,
      });
      // Stub IeltsProfile for awardXp call (xpReward=0 so awardXp is skipped)
      prisma.ieltsProfile.findUnique.mockResolvedValue(null);

      const service = await buildService(prisma, notifications);
      await service.tryGrantAchievement(USER_ID, 'CM_FIRST_POST');

      expect(prisma.userAchievement.create).toHaveBeenCalledTimes(1);
      expect(notifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: USER_ID, type: 'ACHIEVEMENT' }),
      );
    });

    it('no-ops when achievement definition is missing in DB', async () => {
      const prisma = makePrismaMock();
      const notifications = makeNotificationsMock();
      prisma.userAchievement.findFirst.mockResolvedValue(null);
      prisma.achievement.findUnique.mockResolvedValue(null); // Not seeded

      const service = await buildService(prisma, notifications);
      await service.tryGrantAchievement(USER_ID, 'UNKNOWN_KEY');

      expect(prisma.userAchievement.create).not.toHaveBeenCalled();
      expect(notifications.create).not.toHaveBeenCalled();
    });
  });
});
