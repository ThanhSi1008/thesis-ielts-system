import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateDeckDto, CreateFlashcardDto, UpdateFlashcardDto, SubmitReviewDto,
  CreateCardTypeDto, RenameCardTypeDto, UpdateCardTypeDescriptionDto,
  CreateCardTypeFieldDto, UpdateCardTypeFieldDto, UpdateCardTemplateDto,
} from './dto/vocab-lab.dto';
import { CardState } from '@prisma/client';
import { fsrs, Rating, Card, State, Grade, createEmptyCard } from 'ts-fsrs';

const f = fsrs({
  request_retention: 0.9,
  maximum_interval: 365,
});

const BASIC_CARD_TYPE_NAME = 'Basic';

function toFsrsState(state: CardState): State {
  switch (state) {
    case 'NEW': return State.New;
    case 'LEARNING': return State.Learning;
    case 'REVIEW': return State.Review;
    case 'RELEARNING': return State.Relearning;
    default: return State.New;
  }
}

function toPrismaState(state: State): CardState {
  switch (state) {
    case State.New: return 'NEW';
    case State.Learning: return 'LEARNING';
    case State.Review: return 'REVIEW';
    case State.Relearning: return 'RELEARNING';
    default: return 'NEW';
  }
}

function toFsrsRating(rating: number): Grade {
  switch (rating) {
    case 1: return Rating.Again as Grade;
    case 2: return Rating.Hard as Grade;
    case 3: return Rating.Good as Grade;
    case 4: return Rating.Easy as Grade;
    default: return Rating.Good as Grade;
  }
}

@Injectable()
export class VocabLabService {
  constructor(private readonly prisma: PrismaService) { }

  // ==================== NOTE TYPE OPERATIONS ====================

  async ensureBasicCardType(): Promise<string> {
    let basic = await this.prisma.cardType.findFirst({ where: { isBuiltIn: true, name: BASIC_CARD_TYPE_NAME } });
    if (!basic) {
      basic = await this.prisma.cardType.create({
        data: {
          name: BASIC_CARD_TYPE_NAME,
          isBuiltIn: true,
          fields: {
            create: [
              { name: 'Front', order: 0 },
              { name: 'Back', order: 1 },
            ],
          },
        },
        include: { fields: true },
      });
      // create default card template
      const fields = (basic as any).fields as Array<{ id: string; name: string }>;
      const frontField = fields.find(f => f.name === 'Front');
      const backField = fields.find(f => f.name === 'Back');
      await this.prisma.cardTemplate.create({
        data: {
          cardType: { connect: { id: basic.id } },
          name: 'Card 1: Front → Back',
          frontFields: frontField ? [frontField.id] : [],
          backFields: backField ? [backField.id] : [],
        },
      });
    }
    return basic.id;
  }

  async getCardTypes(userId: string) {
    await this.ensureBasicCardType();
    const types = await this.prisma.cardType.findMany({
      where: { OR: [{ isBuiltIn: true }, { userId }] },
      include: {
        fields: { orderBy: { order: 'asc' } },
        templates: true,
        _count: { select: { flashcards: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    return types.map(nt => ({
      id: nt.id,
      name: nt.name,
      description: nt.description ?? null,
      isBuiltIn: nt.isBuiltIn,
      fields: nt.fields,
      templates: nt.templates,
      cardCount: nt._count.flashcards,
    }));
  }

  async createCardType(userId: string, dto: CreateCardTypeDto) {
    const nt = await this.prisma.cardType.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        fields: {
          create: [
            { name: 'Front', order: 0 },
            { name: 'Back', order: 1 },
          ],
        },
      },
      include: { fields: true },
    });
    const fields = nt.fields;
    await this.prisma.cardTemplate.create({
      data: {
        cardType: { connect: { id: nt.id } },
        name: 'Card 1: Front → Back',
        frontFields: [fields[0].id],
        backFields: [fields[1].id],
      },
    });
    return this.prisma.cardType.findUnique({
      where: { id: nt.id },
      include: { fields: { orderBy: { order: 'asc' } }, templates: true },
    });
  }

  async updateCardTypeDescription(cardTypeId: string, dto: UpdateCardTypeDescriptionDto) {
    const nt = await this.prisma.cardType.findFirst({ where: { id: cardTypeId } });
    if (!nt) throw new NotFoundException('Card type not found');
    return this.prisma.cardType.update({
      where: { id: cardTypeId },
      data: { description: dto.description ?? null },
    });
  }

  async renameCardType(userId: string, cardTypeId: string, dto: RenameCardTypeDto) {
    const nt = await this.prisma.cardType.findFirst({ where: { id: cardTypeId } });
    if (!nt) throw new NotFoundException('Card type not found');
    if (nt.isBuiltIn) throw new ForbiddenException('Cannot rename built-in card types');
    if (nt.userId !== userId) throw new ForbiddenException('Not yours');
    return this.prisma.cardType.update({ where: { id: cardTypeId }, data: { name: dto.name } });
  }

  async deleteCardType(userId: string, cardTypeId: string) {
    const nt = await this.prisma.cardType.findFirst({
      where: { id: cardTypeId },
      include: { _count: { select: { flashcards: true } } },
    });
    if (!nt) throw new NotFoundException('Card type not found');
    if (nt.isBuiltIn) throw new ForbiddenException('Cannot delete built-in card types');
    if (nt.userId !== userId) throw new ForbiddenException('Not yours');
    if ((nt as any)._count.flashcards > 0) {
      await this.prisma.flashcard.deleteMany({ where: { cardTypeId } });
    }
    return this.prisma.cardType.delete({ where: { id: cardTypeId } });
  }

  // ==================== NOTE TYPE FIELD OPERATIONS ====================

  async addField(userId: string, cardTypeId: string, dto: CreateCardTypeFieldDto) {
    await this.assertCardTypeOwner(userId, cardTypeId);
    const maxOrder = await this.prisma.cardTypeField.aggregate({ where: { cardTypeId }, _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;
    return this.prisma.cardTypeField.create({
      data: {
        cardTypeId,
        name: dto.name,
        order: nextOrder,
        description: dto.description,
        fieldType: dto.fieldType || 'text',
      }
    });
  }

  async updateField(userId: string, cardTypeId: string, fieldId: string, dto: UpdateCardTypeFieldDto) {
    await this.assertCardTypeOwner(userId, cardTypeId);
    return this.prisma.cardTypeField.update({
      where: { id: fieldId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.fieldType !== undefined && { fieldType: dto.fieldType }),
      },
    });
  }

  async deleteField(userId: string, cardTypeId: string, fieldId: string) {
    await this.assertCardTypeOwner(userId, cardTypeId);
    const cardsWithField = await this.prisma.flashcard.findFirst({
      where: { cardTypeId },
    });
    if (cardsWithField) throw new BadRequestException('Cannot delete a field while cards exist for this card type');
    return this.prisma.cardTypeField.delete({ where: { id: fieldId } });
  }

  // ==================== CARD TEMPLATE OPERATIONS ====================

  async getTemplates(userId: string, cardTypeId: string) {
    const nt = await this.prisma.cardType.findFirst({
      where: { id: cardTypeId, OR: [{ isBuiltIn: true }, { userId }] },
    });
    if (!nt) throw new NotFoundException('Card type not found');
    return this.prisma.cardTemplate.findMany({ where: { cardTypeId } });
  }

  async updateTemplate(userId: string, cardTypeId: string, templateId: string, dto: UpdateCardTemplateDto) {
    await this.assertCardTypeOwner(userId, cardTypeId);
    return this.prisma.cardTemplate.update({
      where: { id: templateId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.frontFields !== undefined && { frontFields: dto.frontFields }),
        ...(dto.backFields !== undefined && { backFields: dto.backFields }),
        ...(dto.fieldStyles !== undefined && { fieldStyles: dto.fieldStyles }),
        ...(dto.cardStyle !== undefined && { cardStyle: dto.cardStyle }),
      },
    });
  }

  private async assertCardTypeOwner(userId: string, cardTypeId: string) {
    const nt = await this.prisma.cardType.findFirst({ where: { id: cardTypeId } });
    if (!nt) throw new NotFoundException('Card type not found');
    if (nt.isBuiltIn) throw new ForbiddenException('Cannot modify built-in note types');
    if (nt.userId !== userId) throw new ForbiddenException('Not yours');
    return nt;
  }

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
      const newCount = Math.min(20, deck.flashcards.filter((f) => f.cardState === CardState.NEW).length);
      const learningCount = deck.flashcards.filter(
        (f) => f.cardState === CardState.LEARNING && f.nextReviewDate <= now,
      ).length;
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
    const newCount = Math.min(20, deck.flashcards.filter((f) => f.cardState === CardState.NEW).length);
    const learningCount = deck.flashcards.filter(
      (f) => f.cardState === CardState.LEARNING && f.nextReviewDate <= now,
    ).length;
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
    const deck = await this.prisma.deck.findFirst({ where: { id: dto.deckId, userId } });
    if (!deck) throw new ForbiddenException('Deck not found or not yours');

    // Resolve cardTypeId — use provided or fall back to built-in Basic
    let cardTypeId = dto.cardTypeId;
    if (!cardTypeId) {
      cardTypeId = await this.ensureBasicCardType();
    }

    // If Basic (front/back fields), derive fieldValues from front+back if not already provided
    let fieldValues = dto.fieldValues ?? {};
    if (Object.keys(fieldValues).length === 0 && dto.front !== undefined) {
      // Store legacy front/back as fieldValues keyed by field name for display
      fieldValues = { '__front': dto.front ?? '', '__back': dto.back ?? '' };
    }

    return this.prisma.flashcard.create({
      data: {
        deckId: dto.deckId,
        front: dto.front ?? '',
        back: dto.back ?? '',
        tags: dto.tags || [],
        cardTypeId,
        fieldValues,
        fieldStyles: dto.fieldStyles,
        cardStyle: dto.cardStyle,
      },
      include: {
        cardType: {
          include: { fields: { orderBy: { order: 'asc' } }, templates: true },
        },
      },
    });
  }

  async updateFlashcard(userId: string, cardId: string, dto: UpdateFlashcardDto) {
    const card = await this.prisma.flashcard.findFirst({
      where: { id: cardId },
      include: { deck: { select: { userId: true } } },
    });
    if (!card || card.deck.userId !== userId) throw new NotFoundException('Card not found');

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
        ...(dto.fieldValues !== undefined && { fieldValues: dto.fieldValues }),
        ...(dto.fieldStyles !== undefined && { fieldStyles: dto.fieldStyles }),
        ...(dto.cardStyle !== undefined && { cardStyle: dto.cardStyle }),
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
    const where: any = { deck: { userId } };
    if (filters?.deckId) where.deckId = filters.deckId;
    if (filters?.cardState) where.cardState = filters.cardState;
    if (filters?.tag) where.tags = { has: filters.tag };

    return this.prisma.flashcard.findMany({
      where,
      include: {
        deck: { select: { id: true, name: true } },
        cardType: { include: { fields: { orderBy: { order: 'asc' } }, templates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== STUDY / REVIEW ====================

  async getStudyCards(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findFirst({ where: { id: deckId, userId } });
    if (!deck) throw new NotFoundException('Deck not found');

    const now = new Date();

    const newCards = await this.prisma.flashcard.findMany({
      where: { deckId, cardState: CardState.NEW },
      take: 20,
      orderBy: { createdAt: 'asc' },
      include: {
        cardType: { include: { fields: { orderBy: { order: 'asc' } }, templates: true } },
      },
    });

    const dueCards = await this.prisma.flashcard.findMany({
      where: {
        deckId,
        cardState: { in: [CardState.LEARNING, CardState.REVIEW, CardState.RELEARNING] },
        due: { lte: now },
      },
      orderBy: { due: 'asc' },
      include: {
        cardType: { include: { fields: { orderBy: { order: 'asc' } }, templates: true } },
      },
    });

    return [...dueCards, ...newCards];
  }

  async submitReview(userId: string, dto: SubmitReviewDto) {
    const card = await this.prisma.flashcard.findFirst({
      where: { id: dto.flashcardId },
      include: { deck: { select: { userId: true } } },
    });
    if (!card || card.deck.userId !== userId) throw new NotFoundException('Card not found');

    const fsrsCard: Card = {
      ...createEmptyCard(),
      due: card.due ?? new Date(),
      stability: card.stability,
      difficulty: card.difficulty,
      elapsed_days: card.elapsedDays,
      scheduled_days: card.scheduledDays,
      reps: card.reps,
      lapses: card.lapses,
      state: toFsrsState(card.cardState),
      last_review: card.lastReview ?? undefined,
    };

    const now = new Date();
    const rating = toFsrsRating(dto.rating);
    const result = f.next(fsrsCard, now, rating);
    const next = result.card;

    const updatedCard = await this.prisma.flashcard.update({
      where: { id: dto.flashcardId },
      data: {
        due: next.due,
        stability: next.stability,
        difficulty: next.difficulty,
        elapsedDays: next.elapsed_days,
        scheduledDays: next.scheduled_days,
        reps: next.reps,
        lapses: next.lapses,
        lastReview: now,
        nextReviewDate: next.due,
        cardState: toPrismaState(next.state),
      },
    });

    await this.prisma.flashcardReview.create({
      data: {
        flashcardId: dto.flashcardId,
        rating: dto.rating,
        scheduledDays: next.scheduled_days,
        elapsedDays: next.elapsed_days,
        state: toPrismaState(next.state),
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

    return {
      newCount: cards.filter((c) => c.cardState === CardState.NEW).length,
      learningCount: cards.filter((c) => c.cardState === CardState.LEARNING).length,
      reviewCount: cards.filter((c) => c.cardState === CardState.REVIEW).length,
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
