import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDeckDto, CreateFlashcardDto, UpdateFlashcardDto, SubmitReviewDto } from './dto/vocab-lab.dto';
import { CardState } from '@prisma/client';

@Injectable()
export class VocabLabService {
  constructor(private readonly prisma: PrismaService) { }

  // ==================== DECK OPERATIONS ====================

  async getDecks(userId: string) {
    const decks = await this.prisma.deck.findMany({
      where: { userId },
      include: {
        flashcards: {
          select: { cardState: true, nextReviewDate: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();
    return decks.map((deck) => {
      const newCount = deck.flashcards.filter((f) => f.cardState === CardState.NEW).length;
      const learningCount = deck.flashcards.filter((f) => f.cardState === CardState.LEARNING).length;
      const dueCount = deck.flashcards.filter(
        (f) => f.cardState === CardState.REVIEW && f.nextReviewDate <= now,
      ).length;

      return {
        id: deck.id,
        name: deck.name,
        createdAt: deck.createdAt,
        newCount,
        learningCount,
        dueCount,
        totalCards: deck.flashcards.length,
      };
    });
  }

  async getDeckDetail(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, userId },
      include: {
        flashcards: {
          select: { cardState: true, nextReviewDate: true },
        },
      },
    });

    if (!deck) throw new NotFoundException('Deck not found');

    const now = new Date();
    const newCount = deck.flashcards.filter((f) => f.cardState === CardState.NEW).length;
    const learningCount = deck.flashcards.filter((f) => f.cardState === CardState.LEARNING).length;
    const dueCount = deck.flashcards.filter(
      (f) => f.cardState === CardState.REVIEW && f.nextReviewDate <= now,
    ).length;

    return {
      id: deck.id,
      name: deck.name,
      createdAt: deck.createdAt,
      newCount,
      learningCount,
      dueCount,
      totalCards: deck.flashcards.length,
    };
  }

  async createDeck(userId: string, dto: CreateDeckDto) {
    return this.prisma.deck.create({
      data: { userId, name: dto.name },
    });
  }

  async deleteDeck(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findFirst({ where: { id: deckId, userId } });
    if (!deck) throw new NotFoundException('Deck not found');
    return this.prisma.deck.delete({ where: { id: deckId } });
  }

  // ==================== FLASHCARD OPERATIONS ====================

  async createFlashcard(userId: string, dto: CreateFlashcardDto) {
    // Verify the deck belongs to this user
    const deck = await this.prisma.deck.findFirst({ where: { id: dto.deckId, userId } });
    if (!deck) throw new ForbiddenException('Deck not found or not yours');

    return this.prisma.flashcard.create({
      data: {
        deckId: dto.deckId,
        front: dto.front,
        back: dto.back,
        tags: dto.tags || [],
      },
    });
  }

  async updateFlashcard(userId: string, cardId: string, dto: UpdateFlashcardDto) {
    const card = await this.prisma.flashcard.findFirst({
      where: { id: cardId },
      include: { deck: { select: { userId: true } } },
    });
    if (!card || card.deck.userId !== userId) throw new NotFoundException('Card not found');

    // If changing deck, verify new deck belongs to user
    if (dto.deckId) {
      const newDeck = await this.prisma.deck.findFirst({ where: { id: dto.deckId, userId } });
      if (!newDeck) throw new ForbiddenException('Target deck not found');
    }

    return this.prisma.flashcard.update({
      where: { id: cardId },
      data: {
        ...(dto.front !== undefined && { front: dto.front }),
        ...(dto.back !== undefined && { back: dto.back }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.deckId !== undefined && { deckId: dto.deckId }),
      },
    });
  }

  async deleteFlashcard(userId: string, cardId: string) {
    const card = await this.prisma.flashcard.findFirst({
      where: { id: cardId },
      include: { deck: { select: { userId: true } } },
    });
    if (!card || card.deck.userId !== userId) throw new NotFoundException('Card not found');
    return this.prisma.flashcard.delete({ where: { id: cardId } });
  }

  async browseCards(userId: string, filters?: { deckId?: string; cardState?: CardState; tag?: string }) {
    const where: any = {
      deck: { userId },
    };
    if (filters?.deckId) where.deckId = filters.deckId;
    if (filters?.cardState) where.cardState = filters.cardState;
    if (filters?.tag) where.tags = { has: filters.tag };

    return this.prisma.flashcard.findMany({
      where,
      include: {
        deck: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== STUDY / REVIEW ====================

  async getStudyCards(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findFirst({ where: { id: deckId, userId } });
    if (!deck) throw new NotFoundException('Deck not found');

    const now = new Date();

    // Get new cards (limit 20 per session)
    const newCards = await this.prisma.flashcard.findMany({
      where: { deckId, cardState: CardState.NEW },
      take: 20,
      orderBy: { createdAt: 'asc' },
    });

    // Get due cards (learning + review that are past nextReviewDate)
    const dueCards = await this.prisma.flashcard.findMany({
      where: {
        deckId,
        cardState: { in: [CardState.LEARNING, CardState.REVIEW] },
        nextReviewDate: { lte: now },
      },
      orderBy: { nextReviewDate: 'asc' },
    });

    return [...dueCards, ...newCards];
  }

  async submitReview(userId: string, dto: SubmitReviewDto) {
    const card = await this.prisma.flashcard.findFirst({
      where: { id: dto.flashcardId },
      include: { deck: { select: { userId: true } } },
    });
    if (!card || card.deck.userId !== userId) throw new NotFoundException('Card not found');

    const q = dto.rating;

    // 1. Update Ease Factor
    let newEF = card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEF < 1.3) newEF = 1.3;

    let newInterval: number;
    let newRepetition: number;
    let newState: CardState;

    if (q < 3) {
      // Failed - reset
      newRepetition = 0;
      newInterval = 1;
      newState = CardState.LEARNING;
    } else {
      // Passed
      if (card.repetition === 0) {
        newInterval = 1;
      } else if (card.repetition === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(card.interval * newEF);
      }
      newRepetition = card.repetition + 1;
      newState = newRepetition > 1 ? CardState.REVIEW : CardState.LEARNING;
    }

    // Calculate next review date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    // Update card
    const updatedCard = await this.prisma.flashcard.update({
      where: { id: dto.flashcardId },
      data: {
        easeFactor: newEF,
        interval: newInterval,
        repetition: newRepetition,
        cardState: newState,
        nextReviewDate,
      },
    });

    // Log the review
    await this.prisma.flashcardReview.create({
      data: {
        flashcardId: dto.flashcardId,
        rating: q,
      },
    });

    return updatedCard;
  }

  // ==================== STATS & TAGS ====================

  async getStats(userId: string) {
    const cards = await this.prisma.flashcard.findMany({
      where: { deck: { userId } },
      select: { cardState: true },
    });

    const newCount = cards.filter((c) => c.cardState === CardState.NEW).length;
    const learningCount = cards.filter((c) => c.cardState === CardState.LEARNING).length;
    const reviewCount = cards.filter((c) => c.cardState === CardState.REVIEW).length;

    return {
      newCount,
      learningCount,
      reviewCount,
      totalCount: cards.length,
    };
  }

  async getTags(userId: string) {
    const cards = await this.prisma.flashcard.findMany({
      where: { deck: { userId } },
      select: { tags: true },
    });

    const tagSet = new Set<string>();
    cards.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }
}
