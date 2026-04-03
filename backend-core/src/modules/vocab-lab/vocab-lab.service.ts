import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateDeckDto, CreateFlashcardDto, UpdateFlashcardDto, SubmitReviewDto,
  CreateNoteTypeDto, RenameNoteTypeDto, UpdateNoteTypeDescriptionDto,
  CreateNoteTypeFieldDto, UpdateNoteTypeFieldDto, UpdateCardTemplateDto,
} from './dto/vocab-lab.dto';
import { CardState } from '@prisma/client';

const BASIC_NOTE_TYPE_NAME = 'Basic';

@Injectable()
export class VocabLabService {
  constructor(private readonly prisma: PrismaService) { }

  // ==================== NOTE TYPE OPERATIONS ====================

  async ensureBasicNoteType(): Promise<string> {
    let basic = await this.prisma.noteType.findFirst({ where: { isBuiltIn: true, name: BASIC_NOTE_TYPE_NAME } });
    if (!basic) {
      basic = await this.prisma.noteType.create({
        data: {
          name: BASIC_NOTE_TYPE_NAME,
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
          noteTypeId: basic.id,
          name: 'Card 1: Front → Back',
          frontFields: frontField ? [frontField.id] : [],
          backFields: backField ? [backField.id] : [],
        },
      });
    }
    return basic.id;
  }

  async getNoteTypes(userId: string) {
    await this.ensureBasicNoteType();
    const types = await this.prisma.noteType.findMany({
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

  async createNoteType(userId: string, dto: CreateNoteTypeDto) {
    const nt = await this.prisma.noteType.create({
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
        noteTypeId: nt.id,
        name: 'Card 1: Front → Back',
        frontFields: [fields[0].id],
        backFields: [fields[1].id],
      },
    });
    return this.prisma.noteType.findUnique({
      where: { id: nt.id },
      include: { fields: { orderBy: { order: 'asc' } }, templates: true },
    });
  }

  async updateNoteTypeDescription(noteTypeId: string, dto: UpdateNoteTypeDescriptionDto) {
    const nt = await this.prisma.noteType.findFirst({ where: { id: noteTypeId } });
    if (!nt) throw new NotFoundException('Note type not found');
    return this.prisma.noteType.update({
      where: { id: noteTypeId },
      data: { description: dto.description ?? null },
    });
  }

  async renameNoteType(userId: string, noteTypeId: string, dto: RenameNoteTypeDto) {
    const nt = await this.prisma.noteType.findFirst({ where: { id: noteTypeId } });
    if (!nt) throw new NotFoundException('Note type not found');
    if (nt.isBuiltIn) throw new ForbiddenException('Cannot rename built-in note types');
    if (nt.userId !== userId) throw new ForbiddenException('Not yours');
    return this.prisma.noteType.update({ where: { id: noteTypeId }, data: { name: dto.name } });
  }

  async deleteNoteType(userId: string, noteTypeId: string) {
    const nt = await this.prisma.noteType.findFirst({
      where: { id: noteTypeId },
      include: { _count: { select: { flashcards: true } } },
    });
    if (!nt) throw new NotFoundException('Note type not found');
    if (nt.isBuiltIn) throw new ForbiddenException('Cannot delete built-in note types');
    if (nt.userId !== userId) throw new ForbiddenException('Not yours');
    if ((nt as any)._count.flashcards > 0) throw new BadRequestException('Cannot delete a note type that has cards');
    return this.prisma.noteType.delete({ where: { id: noteTypeId } });
  }

  // ==================== NOTE TYPE FIELD OPERATIONS ====================

  async addField(userId: string, noteTypeId: string, dto: CreateNoteTypeFieldDto) {
    await this.assertNoteTypeOwner(userId, noteTypeId);
    const maxOrder = await this.prisma.noteTypeField.aggregate({ where: { noteTypeId }, _max: { order: true } });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;
    return this.prisma.noteTypeField.create({
      data: {
        noteTypeId,
        name: dto.name,
        order: nextOrder,
        description: dto.description,
        fieldType: dto.fieldType || 'text',
      }
    });
  }

  async updateField(userId: string, noteTypeId: string, fieldId: string, dto: UpdateNoteTypeFieldDto) {
    await this.assertNoteTypeOwner(userId, noteTypeId);
    return this.prisma.noteTypeField.update({
      where: { id: fieldId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.fieldType !== undefined && { fieldType: dto.fieldType }),
      },
    });
  }

  async deleteField(userId: string, noteTypeId: string, fieldId: string) {
    await this.assertNoteTypeOwner(userId, noteTypeId);
    const cardsWithField = await this.prisma.flashcard.findFirst({
      where: { noteTypeId },
    });
    if (cardsWithField) throw new BadRequestException('Cannot delete a field while cards exist for this note type');
    return this.prisma.noteTypeField.delete({ where: { id: fieldId } });
  }

  // ==================== CARD TEMPLATE OPERATIONS ====================

  async getTemplates(userId: string, noteTypeId: string) {
    const nt = await this.prisma.noteType.findFirst({
      where: { id: noteTypeId, OR: [{ isBuiltIn: true }, { userId }] },
    });
    if (!nt) throw new NotFoundException('Note type not found');
    return this.prisma.cardTemplate.findMany({ where: { noteTypeId } });
  }

  async updateTemplate(userId: string, noteTypeId: string, templateId: string, dto: UpdateCardTemplateDto) {
    await this.assertNoteTypeOwner(userId, noteTypeId);
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

  private async assertNoteTypeOwner(userId: string, noteTypeId: string) {
    const nt = await this.prisma.noteType.findFirst({ where: { id: noteTypeId } });
    if (!nt) throw new NotFoundException('Note type not found');
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

    // Resolve noteTypeId — use provided or fall back to built-in Basic
    let noteTypeId = dto.noteTypeId;
    if (!noteTypeId) {
      noteTypeId = await this.ensureBasicNoteType();
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
        noteTypeId,
        fieldValues,
        fieldStyles: dto.fieldStyles,
        cardStyle: dto.cardStyle,
      },
      include: {
        noteType: {
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
        noteType: { include: { fields: { orderBy: { order: 'asc' } }, templates: true } },
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
        noteType: { include: { fields: { orderBy: { order: 'asc' } }, templates: true } },
      },
    });

    const dueCards = await this.prisma.flashcard.findMany({
      where: {
        deckId,
        cardState: { in: [CardState.LEARNING, CardState.REVIEW] },
        nextReviewDate: { lte: now },
      },
      orderBy: { nextReviewDate: 'asc' },
      include: {
        noteType: { include: { fields: { orderBy: { order: 'asc' } }, templates: true } },
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

    const q = dto.rating;
    let newEF = card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEF < 1.3) newEF = 1.3;

    let newInterval: number;
    let newRepetition: number;
    let newState: CardState;

    if (q < 3) {
      newRepetition = 0;
      newInterval = 1;
      newState = CardState.LEARNING;
    } else {
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

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

    const updatedCard = await this.prisma.flashcard.update({
      where: { id: dto.flashcardId },
      data: { easeFactor: newEF, interval: newInterval, repetition: newRepetition, cardState: newState, nextReviewDate },
    });

    await this.prisma.flashcardReview.create({
      data: { flashcardId: dto.flashcardId, rating: q },
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
