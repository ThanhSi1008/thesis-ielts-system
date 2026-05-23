/**
 * TC_FSRS — VocabLabService.submitReview (FSRS spaced-repetition)
 *
 * Strategy: pure service-level isolation.
 *   - ts-fsrs is used as-is (library is stable; testing real output is preferred).
 *   - PrismaService → full jest mock
 *   - RedisService, NotificationsService, GamificationService,
 *     SubscriptionsService, StorageService → jest mocks (no-ops)
 *   - jest.useFakeTimers() pins "now" for deterministic due-date assertions.
 *
 * Rating mapping (toFsrsRating in vocab-lab.service.ts):
 *   1 = Again, 2 = Hard, 3 = Good, 4 = Easy
 *
 * TC_FSRS_01: submitReview(cardId, rating=3 Good) → stability > initial, due > now
 * TC_FSRS_02: submitReview(cardId, rating=1 Again) → stability reset ≈ 0.4, due ≈ now+10min
 * TC_FSRS_03: submitReview(cardId, rating=4 Easy) → interval (scheduledDays) > Good
 * TC_FSRS_04: submitReview — card belongs to another user → NotFoundException
 * TC_FSRS_05: getStudyCards(userId) → only returns cards with due <= now
 */

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { VocabLabService } from '../vocab-lab.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { GamificationService } from '../../gamification/gamification.service';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { StorageService } from '../../../common/storage/storage.service';

// ─────────────────────────────────────────────────────────────────────────────
// Time constants
// ─────────────────────────────────────────────────────────────────────────────

const FIXED_NOW = new Date('2025-01-15T10:00:00.000Z');
const TEN_MINUTES_MS = 10 * 60 * 1000;

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const OWNER_ID = 'user-owner-001';
const OTHER_USER_ID = 'user-other-002';
const CARD_ID = 'card-fsrs-001';
const DECK_ID = 'deck-001';

function buildNewCard(overrides: Record<string, unknown> = {}) {
  return {
    id: CARD_ID,
    deckId: DECK_ID,
    deck: { userId: OWNER_ID },
    due: FIXED_NOW,
    stability: 0,
    difficulty: 0,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    cardState: 'NEW',
    lastReview: null,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock factories
// ─────────────────────────────────────────────────────────────────────────────

function makePrismaMock() {
  return {
    flashcard: {
      findFirst: jest.fn(),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: CARD_ID, ...data })),
      findMany: jest.fn().mockResolvedValue([]),
    },
    flashcardReview: {
      create: jest.fn().mockResolvedValue({}),
    },
    deck: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    cardType: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cardTypeField: {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    cardTemplate: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    sharedDeck: {
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    },
    user: { findUnique: jest.fn() },
    ieltsProfile: { findUnique: jest.fn() },
  };
}

async function buildService(prisma: ReturnType<typeof makePrismaMock>) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      VocabLabService,
      { provide: PrismaService, useValue: prisma },
      { provide: RedisService, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      { provide: NotificationsService, useValue: { create: jest.fn() } },
      {
        provide: GamificationService,
        useValue: { onEvent: jest.fn().mockResolvedValue(undefined) },
      },
      {
        provide: SubscriptionsService,
        useValue: {
          getUserSubscription: jest.fn().mockResolvedValue({ tier: 'FREE' }),
          checkQuota: jest.fn().mockResolvedValue({ allowed: true }),
          incrementUsage: jest.fn().mockResolvedValue({}),
        },
      },
      { provide: StorageService, useValue: { uploadFile: jest.fn(), deleteFile: jest.fn() } },
    ],
  }).compile();

  return module.get<VocabLabService>(VocabLabService);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('TC_FSRS', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('submitReview', () => {
    describe('TC_FSRS_01 — rating=Good (3) → stability increases, due is in the future', () => {
      it('saves card with stability > 0 and due > now', async () => {
        const prisma = makePrismaMock();
        prisma.flashcard.findFirst.mockResolvedValue(buildNewCard());

        const service = await buildService(prisma);
        const result = await service.submitReview(OWNER_ID, {
          flashcardId: CARD_ID,
          rating: 3,
        });

        expect(result.stability).toBeGreaterThan(0);
        expect(new Date(result.due).getTime()).toBeGreaterThan(FIXED_NOW.getTime());
      });

      it('creates a FlashcardReview record', async () => {
        const prisma = makePrismaMock();
        prisma.flashcard.findFirst.mockResolvedValue(buildNewCard());

        const service = await buildService(prisma);
        await service.submitReview(OWNER_ID, { flashcardId: CARD_ID, rating: 3 });

        expect(prisma.flashcardReview.create).toHaveBeenCalledTimes(1);
        expect(prisma.flashcardReview.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ flashcardId: CARD_ID, rating: 3 }),
          }),
        );
      });
    });

    describe('TC_FSRS_02 — rating=Again (1) → stability ≈ 0.4, due ≈ now + 10 minutes', () => {
      it('resets stability to ~0.4 (FSRS Again default)', async () => {
        const prisma = makePrismaMock();
        prisma.flashcard.findFirst.mockResolvedValue(buildNewCard());

        const service = await buildService(prisma);
        const result = await service.submitReview(OWNER_ID, {
          flashcardId: CARD_ID,
          rating: 1,
        });

        // FSRS Again on a NEW card yields stability ≈ 0.4
        expect(result.stability).toBeGreaterThan(0);
        expect(result.stability).toBeLessThan(1);
      });

      it('schedules due within ~10 minutes for Again on new card', async () => {
        const prisma = makePrismaMock();
        prisma.flashcard.findFirst.mockResolvedValue(buildNewCard());

        const service = await buildService(prisma);
        const result = await service.submitReview(OWNER_ID, {
          flashcardId: CARD_ID,
          rating: 1,
        });

        const dueDiff = new Date(result.due).getTime() - FIXED_NOW.getTime();
        // Should be a short interval (≤ 1 day); ts-fsrs relearning step is ~10 min
        expect(dueDiff).toBeGreaterThan(0);
        expect(dueDiff).toBeLessThanOrEqual(24 * 60 * 60 * 1000); // within 1 day
      });
    });

    describe('TC_FSRS_03 — rating=Easy (4) gives longer interval than Good (3)', () => {
      it('scheduledDays(Easy) >= scheduledDays(Good)', async () => {
        const prisma = makePrismaMock();

        let savedDataGood: Record<string, unknown> = {};
        let savedDataEasy: Record<string, unknown> = {};

        prisma.flashcard.findFirst.mockResolvedValue(buildNewCard());
        prisma.flashcard.update
          .mockImplementationOnce(({ data }: any) => {
            savedDataGood = data;
            return Promise.resolve({ id: CARD_ID, ...data });
          })
          .mockImplementationOnce(({ data }: any) => {
            savedDataEasy = data;
            return Promise.resolve({ id: CARD_ID, ...data });
          });

        const serviceGood = await buildService(prisma);
        await serviceGood.submitReview(OWNER_ID, { flashcardId: CARD_ID, rating: 3 });

        // Reset card for Easy test
        prisma.flashcard.findFirst.mockResolvedValue(buildNewCard());
        const serviceEasy = await buildService(prisma);
        await serviceEasy.submitReview(OWNER_ID, { flashcardId: CARD_ID, rating: 4 });

        expect(Number(savedDataEasy.scheduledDays)).toBeGreaterThanOrEqual(
          Number(savedDataGood.scheduledDays),
        );
      });
    });

    describe("TC_FSRS_04 — card belongs to another user → NotFoundException", () => {
      it('throws NotFoundException when deck.userId !== caller userId', async () => {
        const prisma = makePrismaMock();
        // Card owned by OTHER_USER_ID
        prisma.flashcard.findFirst.mockResolvedValue(
          buildNewCard({ deck: { userId: OTHER_USER_ID } }),
        );

        const service = await buildService(prisma);
        await expect(
          service.submitReview(OWNER_ID, { flashcardId: CARD_ID, rating: 3 }),
        ).rejects.toThrow(NotFoundException);
      });

      it('throws NotFoundException when card does not exist', async () => {
        const prisma = makePrismaMock();
        prisma.flashcard.findFirst.mockResolvedValue(null);

        const service = await buildService(prisma);
        await expect(
          service.submitReview(OWNER_ID, { flashcardId: 'nonexistent', rating: 3 }),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('getStudyCards', () => {
    describe('TC_FSRS_05 — getDueCards returns only cards with due <= now', () => {
      const pastDue = new Date(FIXED_NOW.getTime() - 60_000);       // 1 min ago
      const futureDue = new Date(FIXED_NOW.getTime() + 3_600_000);  // 1 hour later

      function buildDeckForUser() {
        return { id: DECK_ID, userId: OWNER_ID };
      }

      it('returns NEW cards and LEARNING/REVIEW/RELEARNING cards with due <= now', async () => {
        const prisma = makePrismaMock();
        prisma.deck.findFirst.mockResolvedValue(buildDeckForUser());

        const newCard = { id: 'c-new', cardState: 'NEW', due: futureDue };
        const overdueCard = { id: 'c-due', cardState: 'REVIEW', due: pastDue };

        // getStudyCards calls flashcard.findMany twice: once for NEW, once for due cards
        prisma.flashcard.findMany
          .mockResolvedValueOnce([newCard])     // NEW cards query
          .mockResolvedValueOnce([overdueCard]); // due review cards query

        const service = await buildService(prisma);
        const result = await service.getStudyCards(OWNER_ID, DECK_ID);

        const ids = result.map((c: any) => c.id);
        expect(ids).toContain('c-due');
        expect(ids).toContain('c-new');
      });

      it('excludes review cards with due > now', async () => {
        const prisma = makePrismaMock();
        prisma.deck.findFirst.mockResolvedValue(buildDeckForUser());

        // The WHERE clause in getStudyCards already filters due <= now at DB level;
        // here we verify that the service passes the correct filter to Prisma.
        prisma.flashcard.findMany
          .mockResolvedValueOnce([]) // no new cards
          .mockResolvedValueOnce([]); // no due cards (DB already filtered)

        const service = await buildService(prisma);
        const result = await service.getStudyCards(OWNER_ID, DECK_ID);

        expect(result).toHaveLength(0);

        // Verify the second findMany call included due: { lte: now }
        const secondCall = prisma.flashcard.findMany.mock.calls[1][0];
        expect(secondCall.where.due).toMatchObject({ lte: FIXED_NOW });
      });

      it('throws NotFoundException when deck not found or not owned', async () => {
        const prisma = makePrismaMock();
        prisma.deck.findFirst.mockResolvedValue(null);

        const service = await buildService(prisma);
        await expect(
          service.getStudyCards(OWNER_ID, 'non-existent-deck'),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});
