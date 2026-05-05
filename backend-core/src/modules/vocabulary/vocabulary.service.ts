import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@common/prisma/prisma.service";
import { RedisService } from "@common/redis/redis.service";
import { GamificationService } from "../gamification/gamification.service";
import {
  CreateVocabularyBookDto,
  UpdateVocabularyBookDto,
  CreateVocabularyUnitDto,
  UpdateVocabularyUnitDto,
  CreateVocabularyWordDto,
  UpdateVocabularyWordDto,
} from "./dto/vocabulary.dto";

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = "vocabulary";

@Injectable()
export class VocabularyService {
  private readonly logger = new Logger(VocabularyService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private gamificationService: GamificationService,
  ) {}

  // ==================== READ OPERATIONS ====================

  async getBooks() {
    const cacheKey = `${CACHE_PREFIX}:books`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const books = await this.prisma.vocabularyBook.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        wordCount: true,
        _count: { select: { units: true } },
      },
    });

    await this.redis.setJson(cacheKey, books, CACHE_TTL);
    return books;
  }

  async getBookWithUnits(bookId: string) {
    const cacheKey = `${CACHE_PREFIX}:book:${bookId}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const book = await this.prisma.vocabularyBook.findUnique({
      where: { id: bookId },
      include: {
        units: {
          orderBy: { order: "asc" },
          select: { id: true, title: true, order: true },
        },
      },
    });

    if (book) await this.redis.setJson(cacheKey, book, CACHE_TTL);
    return book;
  }

  async getUnitWithContent(unitId: string) {
    const cacheKey = `${CACHE_PREFIX}:unit:${unitId}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const unit = await this.prisma.vocabularyUnit.findUnique({
      where: { id: unitId },
      include: {
        book: { select: { id: true, name: true } },
        words: { orderBy: { order: "asc" } },
        exercises: { orderBy: { order: "asc" } },
        questions: { orderBy: { order: "asc" } },
      },
    });

    if (unit) await this.redis.setJson(cacheKey, unit, CACHE_TTL);
    return unit;
  }

  // ==================== BOOK CRUD ====================

  async createBook(dto: CreateVocabularyBookDto) {
    const book = await this.prisma.vocabularyBook.create({ data: dto });
    await this.invalidateCache();
    return book;
  }

  async updateBook(id: string, dto: UpdateVocabularyBookDto) {
    const book = await this.prisma.vocabularyBook.update({
      where: { id },
      data: dto,
    });
    await this.invalidateCache();
    return book;
  }

  async deleteBook(id: string) {
    await this.prisma.vocabularyBook.delete({ where: { id } });
    await this.invalidateCache();
    return { message: "Book deleted successfully" };
  }

  // ==================== UNIT CRUD ====================

  async createUnit(dto: CreateVocabularyUnitDto) {
    const unit = await this.prisma.vocabularyUnit.create({ data: dto });
    await this.invalidateCache();
    return unit;
  }

  async updateUnit(id: string, dto: UpdateVocabularyUnitDto) {
    const unit = await this.prisma.vocabularyUnit.update({
      where: { id },
      data: dto,
    });
    await this.invalidateCache();
    return unit;
  }

  async deleteUnit(id: string) {
    await this.prisma.vocabularyUnit.delete({ where: { id } });
    await this.invalidateCache();
    return { message: "Unit deleted successfully" };
  }

  // ==================== WORD CRUD ====================

  async createWord(dto: CreateVocabularyWordDto) {
    const word = await this.prisma.vocabularyWord.create({ data: dto });
    await this.invalidateCache();
    return word;
  }

  async updateWord(id: string, dto: UpdateVocabularyWordDto) {
    const word = await this.prisma.vocabularyWord.update({
      where: { id },
      data: dto,
    });
    await this.invalidateCache();
    return word;
  }

  async deleteWord(id: string) {
    await this.prisma.vocabularyWord.delete({ where: { id } });
    await this.invalidateCache();
    return { message: "Word deleted successfully" };
  }

  // ==================== CACHE ====================

  async invalidateCache(pattern?: string) {
    await this.redis.delByPattern(pattern || `${CACHE_PREFIX}:*`);
  }

  // ==================== PROGRESS TRACKING ====================

  /**
   * Get user progress for all units in a book
   */
  async getUserProgress(userId: string, bookId: string) {
    const book = await this.prisma.vocabularyBook.findUnique({
      where: { id: bookId },
      include: {
        units: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            order: true,
            _count: { select: { words: true } },
          },
        },
      },
    });

    if (!book) return null;

    const progress = await this.prisma.vocabularyProgress.findMany({
      where: {
        userId,
        unitId: { in: book.units.map((u) => u.id) },
      },
    });

    const progressMap = new Map(progress.map((p) => [p.unitId, p]));

    return {
      book: {
        id: book.id,
        name: book.name,
      },
      units: book.units.map((unit) => {
        const unitProgress = progressMap.get(unit.id);
        return {
          id: unit.id,
          title: unit.title,
          order: unit.order,
          totalWords: unit._count.words,
          wordsLearned: unitProgress?.wordsLearned || 0,
          exerciseScore: unitProgress?.exerciseScore,
          questionScore: unitProgress?.questionScore,
          isCompleted: unitProgress?.isCompleted || false,
        };
      }),
    };
  }

  /**
   * Update word learning progress
   */
  async updateWordProgress(
    userId: string,
    unitId: string,
    wordsLearned: number,
  ) {
    const unit = await this.prisma.vocabularyUnit.findUnique({
      where: { id: unitId },
      include: { _count: { select: { words: true } } },
    });

    if (!unit) return null;

    const completed = wordsLearned >= unit._count.words;

    const existingProgress = await this.prisma.vocabularyProgress.findUnique({
      where: { userId_unitId: { userId, unitId } },
    });

    if (existingProgress) {
      const updated = await this.prisma.vocabularyProgress.update({
        where: { id: existingProgress.id },
        data: {
          wordsLearned,
          isCompleted: existingProgress.isCompleted || completed,
          completedAt: !existingProgress.isCompleted && completed ? new Date() : undefined,
        },
      });

      if (completed && !existingProgress.isCompleted) {
        this.gamificationService
          .onEvent(userId, {
            xp: 15,
            reason: "VOCAB_UNIT_COMPLETE",
            achievementKeys: ["FV_FIRST_WORDS", "FV_BOOKWORM"],
          })
          .catch(() => {});
      }

      return updated;
    }

    const created = await this.prisma.vocabularyProgress.create({
      data: {
        userId,
        unitId,
        wordsLearned,
        totalWords: unit._count.words,
        isCompleted: completed,
        completedAt: completed ? new Date() : undefined,
      },
    });

    if (completed) {
      this.gamificationService
        .onEvent(userId, {
          xp: 15,
          reason: "VOCAB_UNIT_COMPLETE",
          achievementKeys: ["FV_FIRST_WORDS", "FV_BOOKWORM"],
        })
        .catch(() => {});
    }

    return created;
  }

  /**
   * Submit and grade exercise answers
   */
  async submitExercise(
    userId: string,
    unitId: string,
    answers: { exerciseId: string; answer: string }[],
  ) {
    const exercises = await this.prisma.vocabularyExercise.findMany({
      where: { unitId },
    });

    if (exercises.length === 0) {
      return { score: 0, correctCount: 0, totalQuestions: 0, results: [] };
    }

    let correctCount = 0;
    const results = answers.map((a) => {
      const exercise = exercises.find((e) => e.id === a.exerciseId);
      const isCorrect = exercise?.answer.toLowerCase() === a.answer.toLowerCase();
      if (isCorrect) correctCount++;
      return { exerciseId: a.exerciseId, userAnswer: a.answer, correctAnswer: exercise?.answer || "Unknown", isCorrect };
    });

    const score = Math.round((correctCount / exercises.length) * 100);

    const progress = await this.prisma.vocabularyProgress.findUnique({
      where: { userId_unitId: { userId, unitId } },
    });

    if (progress) {
      const updated = await this.prisma.vocabularyProgress.update({
        where: { id: progress.id },
        data: { exerciseScore: score },
      });

      if (score === 100 && (!progress.exerciseScore || progress.exerciseScore < 100)) {
        this.gamificationService.onEvent(userId, { xp: 5, reason: "VOCAB_PERFECT_SCORE", achievementKeys: ["FV_PERFECT"] }).catch(() => {});
      }

      return { score, correctCount, totalQuestions: exercises.length, results };
    }

    await this.prisma.vocabularyProgress.create({
      data: { userId, unitId, exerciseScore: score },
    });

    if (score === 100) {
      this.gamificationService.onEvent(userId, { xp: 5, reason: "VOCAB_PERFECT_SCORE", achievementKeys: ["FV_PERFECT"] }).catch(() => {});
    }

    return { score, correctCount, totalQuestions: exercises.length, results };
  }

  /**
   * Submit and grade comprehension question answers
   */
  async submitQuestions(
    userId: string,
    unitId: string,
    answers: { questionId: string; answer: string }[],
  ) {
    const questions = await this.prisma.vocabularyQuestion.findMany({
      where: { unitId },
    });

    if (questions.length === 0) {
      return { score: 0, correctCount: 0, totalQuestions: 0, results: [] };
    }

    // Grade answers
    let correctCount = 0;
    const results = answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      const isCorrect = question?.answer.toLowerCase() === a.answer.toLowerCase();
      if (isCorrect) correctCount++;
      return {
        questionId: a.questionId,
        userAnswer: a.answer,
        correctAnswer: question?.answer || "Unknown",
        isCorrect,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // Update progress and mark as completed
    try {
      const progress = await this.prisma.vocabularyProgress.upsert({
        where: {
          userId_unitId: { userId, unitId },
        },
        create: {
          userId,
          unitId,
          questionScore: score,
          isCompleted: true,
          completedAt: new Date(),
        },
        update: {
          questionScore: score,
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      this.gamificationService
        .onEvent(userId, {
          xp: 15,
          reason: "VOCAB_UNIT_COMPLETE",
          achievementKeys: ["FV_FIRST_WORDS", "FV_BOOKWORM"],
        })
        .catch(() => {});
        
    } catch (error) {
      console.error(`[SubmitQuestions] Failed to update progress:`, error);
      throw error;
    }

    return {
      score,
      correctCount,
      totalQuestions: questions.length,
      results,
    };
  }
}
