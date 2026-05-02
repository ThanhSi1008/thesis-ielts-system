import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import {
  CreateDeckDto,
  CreateFlashcardDto,
  UpdateFlashcardDto,
  SubmitReviewDto,
  CreateCardTypeDto,
  RenameCardTypeDto,
  UpdateCardTypeDescriptionDto,
  CreateCardTypeFieldDto,
  UpdateCardTypeFieldDto,
  UpdateCardTemplateDto,
} from "./dto/vocab-lab.dto";
import { CardState } from "@prisma/client";
import { fsrs, Rating, Card, State, Grade, createEmptyCard } from "ts-fsrs";

const f = fsrs({
  request_retention: 0.9,
  maximum_interval: 365,
});

const BASIC_CARD_TYPE_NAME = "Basic";

function toFsrsState(state: CardState): State {
  switch (state) {
    case "NEW":
      return State.New;
    case "LEARNING":
      return State.Learning;
    case "REVIEW":
      return State.Review;
    case "RELEARNING":
      return State.Relearning;
    default:
      return State.New;
  }
}

function toPrismaState(state: State): CardState {
  switch (state) {
    case State.New:
      return "NEW";
    case State.Learning:
      return "LEARNING";
    case State.Review:
      return "REVIEW";
    case State.Relearning:
      return "RELEARNING";
    default:
      return "NEW";
  }
}

function toFsrsRating(rating: number): Grade {
  switch (rating) {
    case 1:
      return Rating.Again as Grade;
    case 2:
      return Rating.Hard as Grade;
    case 3:
      return Rating.Good as Grade;
    case 4:
      return Rating.Easy as Grade;
    default:
      return Rating.Good as Grade;
  }
}

@Injectable()
export class VocabLabService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== NOTE TYPE OPERATIONS ====================

  async ensureBasicCardType(): Promise<string> {
    let basic = await this.prisma.cardType.findFirst({
      where: { isBuiltIn: true, name: BASIC_CARD_TYPE_NAME },
    });
    if (!basic) {
      basic = await this.prisma.cardType.create({
        data: {
          name: BASIC_CARD_TYPE_NAME,
          isBuiltIn: true,
          fields: {
            create: [
              { name: "Front", order: 0 },
              { name: "Back", order: 1 },
            ],
          },
        },
        include: { fields: true },
      });
      // create default card template
      const fields = (basic as any).fields as Array<{
        id: string;
        name: string;
      }>;
      const frontField = fields.find((f) => f.name === "Front");
      const backField = fields.find((f) => f.name === "Back");
      await this.prisma.cardTemplate.create({
        data: {
          cardType: { connect: { id: basic.id } },
          name: "Card 1: Front → Back",
          frontFields: frontField ? [frontField.id] : [],
          backFields: backField ? [backField.id] : [],
        },
      });
    }
    return basic.id;
  }

  async ensureEssentialCardType(userId: string): Promise<string> {
    let essential = await this.prisma.cardType.findFirst({
      where: { name: "essential", OR: [{ userId }, { isBuiltIn: true }] },
    });
    if (!essential) {
      essential = await this.prisma.cardType.create({
        data: {
          name: "essential",
          userId: userId,
          isBuiltIn: false,
          fields: {
            create: [
              { name: "Word", order: 0 },
              { name: "IPA", order: 1 },
              { name: "Meaning", order: 2 },
              { name: "Example", order: 3 },
              { name: "Image", order: 4 },
              { name: "Audio", order: 5, fieldType: "media" },
            ],
          },
        },
        include: { fields: true },
      });
      
      const fields = (essential as any).fields as Array<{ id: string; name: string }>;
      await this.prisma.cardTemplate.create({
        data: {
          cardType: { connect: { id: essential.id } },
          name: "Card 1: Word → Meaning",
          frontFields: [
            fields.find(f => f.name === "Image")?.id,
            fields.find(f => f.name === "Word")?.id
          ].filter(Boolean) as string[],
          backFields: [
            fields.find(f => f.name === "Word")?.id,
            fields.find(f => f.name === "IPA")?.id,
            fields.find(f => f.name === "Meaning")?.id,
            fields.find(f => f.name === "Example")?.id,
            fields.find(f => f.name === "Audio")?.id
          ].filter(Boolean) as string[],
        },
      });
    } else {
      // Step 1b: Migration — ensure Audio field exists for existing card types
      const essentialWithFields = await this.prisma.cardType.findUnique({
        where: { id: essential.id },
        include: { fields: true },
      });
      const hasAudioField = essentialWithFields?.fields.some(f => f.name === "Audio");
      if (!hasAudioField) {
        const maxOrder = essentialWithFields?.fields.reduce(
          (max, f) => Math.max(max, f.order), -1
        ) ?? 4;
        await this.prisma.cardTypeField.create({
          data: {
            cardTypeId: essential.id,
            name: "Audio",
            order: maxOrder + 1,
            fieldType: "media",
          },
        });
      }
    }
    return essential.id;
  }

  async getCardTypes(userId: string) {
    await this.ensureBasicCardType();
    const types = await this.prisma.cardType.findMany({
      where: { OR: [{ isBuiltIn: true }, { userId }] },
      include: {
        fields: { orderBy: { order: "asc" } },
        templates: true,
        _count: { select: { flashcards: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return types.map((nt) => ({
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
            { name: "Front", order: 0 },
            { name: "Back", order: 1 },
          ],
        },
      },
      include: { fields: true },
    });
    const fields = nt.fields;
    await this.prisma.cardTemplate.create({
      data: {
        cardType: { connect: { id: nt.id } },
        name: "Card 1: Front → Back",
        frontFields: [fields[0].id],
        backFields: [fields[1].id],
      },
    });
    return this.prisma.cardType.findUnique({
      where: { id: nt.id },
      include: { fields: { orderBy: { order: "asc" } }, templates: true },
    });
  }

  async updateCardTypeDescription(
    cardTypeId: string,
    dto: UpdateCardTypeDescriptionDto,
  ) {
    const nt = await this.prisma.cardType.findFirst({
      where: { id: cardTypeId },
    });
    if (!nt) throw new NotFoundException("Card type not found");
    return this.prisma.cardType.update({
      where: { id: cardTypeId },
      data: { description: dto.description ?? null },
    });
  }

  async renameCardType(
    userId: string,
    cardTypeId: string,
    dto: RenameCardTypeDto,
  ) {
    const nt = await this.prisma.cardType.findFirst({
      where: { id: cardTypeId },
    });
    if (!nt) throw new NotFoundException("Card type not found");
    if (nt.isBuiltIn)
      throw new ForbiddenException("Cannot rename built-in card types");
    if (nt.userId !== userId) throw new ForbiddenException("Not yours");
    return this.prisma.cardType.update({
      where: { id: cardTypeId },
      data: { name: dto.name },
    });
  }

  async deleteCardType(userId: string, cardTypeId: string) {
    const nt = await this.prisma.cardType.findFirst({
      where: { id: cardTypeId },
      include: { _count: { select: { flashcards: true } } },
    });
    if (!nt) throw new NotFoundException("Card type not found");
    if (nt.isBuiltIn)
      throw new ForbiddenException("Cannot delete built-in card types");
    if (nt.userId !== userId) throw new ForbiddenException("Not yours");
    if ((nt as any)._count.flashcards > 0) {
      await this.prisma.flashcard.deleteMany({ where: { cardTypeId } });
    }
    return this.prisma.cardType.delete({ where: { id: cardTypeId } });
  }

  // ==================== NOTE TYPE FIELD OPERATIONS ====================

  async addField(
    userId: string,
    cardTypeId: string,
    dto: CreateCardTypeFieldDto,
  ) {
    await this.assertCardTypeOwner(userId, cardTypeId);
    const maxOrder = await this.prisma.cardTypeField.aggregate({
      where: { cardTypeId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;
    return this.prisma.cardTypeField.create({
      data: {
        cardTypeId,
        name: dto.name,
        order: nextOrder,
        description: dto.description,
        fieldType: dto.fieldType || "text",
      },
    });
  }

  async updateField(
    userId: string,
    cardTypeId: string,
    fieldId: string,
    dto: UpdateCardTypeFieldDto,
  ) {
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
    if (cardsWithField)
      throw new BadRequestException(
        "Cannot delete a field while cards exist for this card type",
      );
    return this.prisma.cardTypeField.delete({ where: { id: fieldId } });
  }

  // ==================== CARD TEMPLATE OPERATIONS ====================

  async getTemplates(userId: string, cardTypeId: string) {
    const nt = await this.prisma.cardType.findFirst({
      where: { id: cardTypeId, OR: [{ isBuiltIn: true }, { userId }] },
    });
    if (!nt) throw new NotFoundException("Card type not found");
    return this.prisma.cardTemplate.findMany({ where: { cardTypeId } });
  }

  async updateTemplate(
    userId: string,
    cardTypeId: string,
    templateId: string,
    dto: UpdateCardTemplateDto,
  ) {
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
    const nt = await this.prisma.cardType.findFirst({
      where: { id: cardTypeId },
    });
    if (!nt) throw new NotFoundException("Card type not found");
    if (nt.isBuiltIn)
      throw new ForbiddenException("Cannot modify built-in note types");
    if (nt.userId !== userId) throw new ForbiddenException("Not yours");
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
      orderBy: { createdAt: "asc" },
    });

    const now = new Date();
    return decks.map((deck) => {
      const newCount = Math.min(
        20,
        deck.flashcards.filter((f) => f.cardState === CardState.NEW).length,
      );
      const learningCount = deck.flashcards.filter(
        (f) =>
          (f.cardState === CardState.LEARNING ||
            f.cardState === CardState.RELEARNING) &&
          f.nextReviewDate <= now,
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

    if (!deck) throw new NotFoundException("Deck not found");

    const now = new Date();
    const newCount = Math.min(
      20,
      deck.flashcards.filter((f) => f.cardState === CardState.NEW).length,
    );
    const learningCount = deck.flashcards.filter(
      (f) =>
        (f.cardState === CardState.LEARNING ||
          f.cardState === CardState.RELEARNING) &&
        f.nextReviewDate <= now,
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
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, userId },
    });
    if (!deck) throw new NotFoundException("Deck not found");
    return this.prisma.deck.delete({ where: { id: deckId } });
  }

  // ==================== FLASHCARD OPERATIONS ====================

  async createFlashcard(userId: string, dto: CreateFlashcardDto) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: dto.deckId, userId },
    });
    if (!deck) throw new ForbiddenException("Deck not found or not yours");

    // Resolve cardTypeId — use provided or fall back to built-in Basic
    let cardTypeId = dto.cardTypeId;
    if (!cardTypeId) {
      cardTypeId = await this.ensureBasicCardType();
    }

    // If Basic (front/back fields), derive fieldValues from front+back if not already provided
    let fieldValues = dto.fieldValues ?? {};
    if (Object.keys(fieldValues).length === 0 && dto.front !== undefined) {
      // Store legacy front/back as fieldValues keyed by field name for display
      fieldValues = { __front: dto.front ?? "", __back: dto.back ?? "" };
    }

    return this.prisma.flashcard.create({
      data: {
        deckId: dto.deckId,
        front: dto.front ?? "",
        back: dto.back ?? "",
        tags: dto.tags || [],
        cardTypeId,
        fieldValues,
        fieldStyles: dto.fieldStyles,
        cardStyle: dto.cardStyle,
      },
      include: {
        cardType: {
          include: { fields: { orderBy: { order: "asc" } }, templates: true },
        },
      },
    });
  }

  async createFlashcardFromVocabulary(userId: string, bookName: string, word: any) {
    // 1. Ensure deck exists with the book name
    let deck = await this.prisma.deck.findFirst({
      where: { name: bookName, userId },
    });
    if (!deck) {
      deck = await this.prisma.deck.create({
        data: { name: bookName, userId },
      });
    }

    // 2. Ensure "essential" card type exists
    const cardTypeId = await this.ensureEssentialCardType(userId);
    const cardType = await this.prisma.cardType.findUnique({
      where: { id: cardTypeId },
      include: { fields: true },
    });

    // 3. Check for duplicates using a specific tag
    const tag = `vocab-${word.id}`;
    const existing = await this.prisma.flashcard.findFirst({
      where: { deckId: deck.id, tags: { has: tag } },
    });
    if (existing) {
      return existing; // Already added
    }

    // 4. Map the fields
    const fieldValues: Record<string, string> = {};
    if (cardType) {
      const wordField = cardType.fields.find(f => f.name === "Word");
      if (wordField) fieldValues[wordField.id] = word.word;

      const ipaField = cardType.fields.find(f => f.name === "IPA");
      if (ipaField) fieldValues[ipaField.id] = word.ipa || "";

      const meaningField = cardType.fields.find(f => f.name === "Meaning");
      if (meaningField) fieldValues[meaningField.id] = word.meaning || "";

      const exampleField = cardType.fields.find(f => f.name === "Example");
      if (exampleField) fieldValues[exampleField.id] = word.example || "";

      const imageField = cardType.fields.find(f => f.name === "Image");
      if (imageField && word.imageUrl) {
        fieldValues[imageField.id] = `<img src="${word.imageUrl}" alt="${word.word}" style="max-height: 240px; max-width: 100%; border-radius: 8px; object-fit: contain;" />`;
      } else if (imageField) {
        fieldValues[imageField.id] = "";
      }

      // Step 2: Map audioUrl
      const audioField = cardType.fields.find(f => f.name === "Audio");
      if (audioField && word.audioUrl) {
        fieldValues[audioField.id] = word.audioUrl;
      } else if (audioField) {
        fieldValues[audioField.id] = "";
      }
    }

    // 5. Provide fallback raw HTML for the front and back
    const frontHtml = `
      <div style="text-align: center;">
        ${word.imageUrl ? `<img src="${word.imageUrl}" style="max-height: 150px; border-radius: 8px; margin-bottom: 16px;" />` : ''}
        <h2>${word.word}</h2>
      </div>
    `;
    const backHtml = `
      <div style="text-align: center;">
        <h2>${word.word}</h2>
        <p style="color: gray;">[${word.ipa || ''}]</p>
        ${word.audioUrl ? `<audio controls src="${word.audioUrl}" style="margin: 8px auto; display: block;"></audio>` : ''}
        <p style="font-size: 1.2em; margin-top: 16px;">${word.meaning || ''}</p>
        ${word.example ? `<p style="margin-top: 16px; font-style: italic; color: #555;">${word.example}</p>` : ''}
      </div>
    `;

    // 6. Create the flashcard
    return this.prisma.flashcard.create({
      data: {
        deckId: deck.id,
        front: frontHtml,
        back: backHtml,
        cardTypeId: cardTypeId,
        fieldValues,
        tags: [tag],
      },
    });
  }

  async updateFlashcard(
    userId: string,
    cardId: string,
    dto: UpdateFlashcardDto,
  ) {
    const card = await this.prisma.flashcard.findFirst({
      where: { id: cardId },
      include: { deck: { select: { userId: true } } },
    });
    if (!card || card.deck.userId !== userId)
      throw new NotFoundException("Card not found");

    if (dto.deckId) {
      const newDeck = await this.prisma.deck.findFirst({
        where: { id: dto.deckId, userId },
      });
      if (!newDeck) throw new ForbiddenException("Target deck not found");
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
    if (!card || card.deck.userId !== userId)
      throw new NotFoundException("Card not found");
    return this.prisma.flashcard.delete({ where: { id: cardId } });
  }

  async browseCards(
    userId: string,
    filters?: { deckId?: string; cardState?: CardState; tag?: string },
  ) {
    const where: any = { deck: { userId } };
    if (filters?.deckId) where.deckId = filters.deckId;
    if (filters?.cardState) where.cardState = filters.cardState;
    if (filters?.tag) where.tags = { has: filters.tag };

    return this.prisma.flashcard.findMany({
      where,
      include: {
        deck: { select: { id: true, name: true } },
        cardType: {
          include: { fields: { orderBy: { order: "asc" } }, templates: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ==================== STUDY / REVIEW ====================

  async getStudyCards(userId: string, deckId: string) {
    const deck = await this.prisma.deck.findFirst({
      where: { id: deckId, userId },
    });
    if (!deck) throw new NotFoundException("Deck not found");

    const now = new Date();

    const newCards = await this.prisma.flashcard.findMany({
      where: { deckId, cardState: CardState.NEW },
      take: 20,
      orderBy: { createdAt: "asc" },
      include: {
        cardType: {
          include: { fields: { orderBy: { order: "asc" } }, templates: true },
        },
      },
    });

    const dueCards = await this.prisma.flashcard.findMany({
      where: {
        deckId,
        cardState: {
          in: [CardState.LEARNING, CardState.REVIEW, CardState.RELEARNING],
        },
        due: { lte: now },
      },
      orderBy: { due: "asc" },
      include: {
        cardType: {
          include: { fields: { orderBy: { order: "asc" } }, templates: true },
        },
      },
    });

    return [...dueCards, ...newCards];
  }

  async submitReview(userId: string, dto: SubmitReviewDto) {
    const card = await this.prisma.flashcard.findFirst({
      where: { id: dto.flashcardId },
      include: { deck: { select: { userId: true } } },
    });
    if (!card || card.deck.userId !== userId)
      throw new NotFoundException("Card not found");

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

  async getStats(userId: string, range: number = 30) {
    const clampedRange = Math.min(Math.max(range, 7), 365);

    // ── 1. Card state counts ──────────────────────────────────────────────────
    const allCards = await this.prisma.flashcard.findMany({
      where: { deck: { userId } },
      select: { cardState: true, scheduledDays: true, lapses: true, difficulty: true, due: true },
    });

    const cardCounts = {
      newCount: allCards.filter((c) => c.cardState === CardState.NEW).length,
      learningCount: allCards.filter((c) => c.cardState === CardState.LEARNING || c.cardState === CardState.RELEARNING).length,
      reviewCount: allCards.filter((c) => c.cardState === CardState.REVIEW).length,
      relearningCount: allCards.filter((c) => c.cardState === CardState.RELEARNING).length,
      totalCount: allCards.length,
    };

    // ── 2. Review activity (last N days) ─────────────────────────────────────
    const rangeStart = new Date();
    rangeStart.setDate(rangeStart.getDate() - clampedRange);
    rangeStart.setHours(0, 0, 0, 0);

    const recentReviews = await this.prisma.flashcardReview.findMany({
      where: {
        flashcard: { deck: { userId } },
        reviewedAt: { gte: rangeStart },
      },
      select: { reviewedAt: true, rating: true },
    });

    // Build a map: date-string → counts
    const activityMap = new Map<string, { reviewCount: number; againCount: number; hardCount: number; goodCount: number; easyCount: number }>();
    for (let i = 0; i < clampedRange; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (clampedRange - 1 - i));
      const key = d.toISOString().split('T')[0];
      activityMap.set(key, { reviewCount: 0, againCount: 0, hardCount: 0, goodCount: 0, easyCount: 0 });
    }
    for (const r of recentReviews) {
      const key = r.reviewedAt.toISOString().split('T')[0];
      const entry = activityMap.get(key);
      if (entry) {
        entry.reviewCount++;
        if (r.rating === 1) entry.againCount++;
        else if (r.rating === 2) entry.hardCount++;
        else if (r.rating === 3) entry.goodCount++;
        else if (r.rating === 4) entry.easyCount++;
      }
    }
    const reviewActivity = Array.from(activityMap.entries()).map(([date, counts]) => ({ date, ...counts }));

    // ── 3. Streak data ────────────────────────────────────────────────────────
    const allReviewDates = await this.prisma.flashcardReview.findMany({
      where: { flashcard: { deck: { userId } } },
      select: { reviewedAt: true },
      orderBy: { reviewedAt: 'asc' },
    });

    const uniqueDates = Array.from(new Set(allReviewDates.map(r => r.reviewedAt.toISOString().split('T')[0]))).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(uniqueDates[i - 1]);
        const curr = new Date(uniqueDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    // Current streak: count backwards from today
    const lastDate = uniqueDates[uniqueDates.length - 1];
    if (lastDate === today || lastDate === yesterday) {
      currentStreak = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const curr = new Date(uniqueDates[i + 1]);
        const prev = new Date(uniqueDates[i]);
        if (Math.round((curr.getTime() - prev.getTime()) / 86400000) === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    const streakData = {
      currentStreak,
      longestStreak,
      totalReviewDays: uniqueDates.length,
      totalReviews: allReviewDates.length,
    };

    // ── 4. Maturity distribution ──────────────────────────────────────────────
    const maturityDistribution = {
      young: allCards.filter(c => c.cardState === CardState.REVIEW && c.scheduledDays < 21).length,
      mature: allCards.filter(c => c.cardState === CardState.REVIEW && c.scheduledDays >= 21).length,
      suspended: allCards.filter(c => c.lapses > 8).length,
    };

    // ── 5. Forecast (next 30 days) ────────────────────────────────────────────
    const now = new Date();
    const forecastDays = 30;
    const forecastMap = new Map<string, number>();
    for (let i = 0; i < forecastDays; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      forecastMap.set(d.toISOString().split('T')[0], 0);
    }
    for (const card of allCards) {
      if (card.due) {
        const dueKey = card.due.toISOString().split('T')[0];
        if (forecastMap.has(dueKey)) {
          forecastMap.set(dueKey, (forecastMap.get(dueKey) ?? 0) + 1);
        }
      }
    }
    let cumulativeCount = 0;
    const forecast = Array.from(forecastMap.entries()).map(([date, dueCount]) => {
      cumulativeCount += dueCount;
      return { date, dueCount, cumulativeCount };
    });

    // ── 6. Averages ───────────────────────────────────────────────────────────
    const allReviews = await this.prisma.flashcardReview.findMany({
      where: { flashcard: { deck: { userId } } },
      select: { rating: true },
    });
    const totalReviewCount = allReviews.length;
    const retentionCount = allReviews.filter(r => r.rating >= 3).length;
    const avgRating = totalReviewCount > 0 ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewCount : 0;

    const reviewCards = allCards.filter(c => c.cardState === CardState.REVIEW);
    const avgInterval = reviewCards.length > 0 ? reviewCards.reduce((sum, c) => sum + c.scheduledDays, 0) / reviewCards.length : 0;
    const avgLapses = allCards.length > 0 ? allCards.reduce((sum, c) => sum + c.lapses, 0) / allCards.length : 0;

    const averages = {
      averageEasePercent: Math.round(((avgRating - 1) / 3) * 100),
      averageLapses: Math.round(avgLapses * 10) / 10,
      averageInterval: Math.round(avgInterval * 10) / 10,
      retentionRatePercent: totalReviewCount > 0 ? Math.round((retentionCount / totalReviewCount) * 100) : 0,
    };

    // ── 7. Hourly activity ────────────────────────────────────────────────────
    const hourlyMap = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
    for (const r of allReviewDates) {
      const hour = r.reviewedAt.getHours();
      hourlyMap[hour].count++;
    }

    // Backward-compat flat fields
    return {
      ...cardCounts, // newCount, learningCount, reviewCount, totalCount (flat)
      cardCounts,
      reviewActivity,
      streakData,
      maturityDistribution,
      forecast,
      averages,
      hourlyActivity: hourlyMap,
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
