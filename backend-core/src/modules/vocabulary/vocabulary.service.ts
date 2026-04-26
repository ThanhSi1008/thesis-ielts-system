import { Injectable } from "@nestjs/common";
import { PrismaService } from "@common/prisma/prisma.service";
import { RedisService } from "@common/redis/redis.service";
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
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
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

    return this.prisma.vocabularyProgress.upsert({
      where: {
        userId_unitId: { userId, unitId },
      },
      create: {
        userId,
        unitId,
        wordsLearned,
        totalWords: unit._count.words,
      },
      update: {
        wordsLearned,
      },
    });
  }

  /**
   * Submit and grade exercise answers
   */
  async submitExercise(
    userId: string,
    unitId: string,
    answers: { exerciseId: string; answer: string }[],
  ) {
    // Get exercises for this unit
    const exercises = await this.prisma.vocabularyExercise.findMany({
      where: { unitId },
    });

    console.log(
      `[SubmitExercise] User: ${userId}, Unit: ${unitId}, Found ${exercises.length} exercises`,
    );

    if (exercises.length === 0) {
      console.warn(`[SubmitExercise] No exercises found for unit ${unitId}`);
      return {
        score: 0,
        correctCount: 0,
        totalQuestions: 0,
        results: [],
      };
    }

    // Grade answers
    let correctCount = 0;
    const results = answers.map((a) => {
      const exercise = exercises.find((e) => e.id === a.exerciseId);
      if (!exercise) {
        console.warn(`[SubmitExercise] Exercise not found: ${a.exerciseId}`);
      }
      const isCorrect =
        exercise?.answer.toLowerCase() === a.answer.toLowerCase();
      if (isCorrect) correctCount++;
      return {
        exerciseId: a.exerciseId,
        userAnswer: a.answer,
        correctAnswer: exercise?.answer || "Unknown",
        isCorrect,
      };
    });

    const score =
      exercises.length > 0
        ? Math.round((correctCount / exercises.length) * 100)
        : 0;
    console.log(
      `[SubmitExercise] Score: ${score} (${correctCount}/${exercises.length})`,
    );

    // Update progress
    try {
      await this.prisma.vocabularyProgress.upsert({
        where: {
          userId_unitId: { userId, unitId },
        },
        create: {
          userId,
          unitId,
          exerciseScore: score,
        },
        update: {
          exerciseScore: score,
        },
      });
    } catch (error) {
      console.error(`[SubmitExercise] Failed to update progress:`, error);
      throw error;
    }

    return {
      score,
      correctCount,
      totalQuestions: exercises.length,
      results,
    };
  }

  /**
   * Submit and grade comprehension question answers
   */
  async submitQuestions(
    userId: string,
    unitId: string,
    answers: { questionId: string; answer: string }[],
  ) {
    // Get questions for this unit
    const questions = await this.prisma.vocabularyQuestion.findMany({
      where: { unitId },
    });

    console.log(
      `[SubmitQuestions] User: ${userId}, Unit: ${unitId}, Found ${questions.length} questions`,
    );

    if (questions.length === 0) {
      console.warn(`[SubmitQuestions] No questions found for unit ${unitId}`);
      return {
        score: 0,
        correctCount: 0,
        totalQuestions: 0,
        results: [],
      };
    }

    // Grade answers
    let correctCount = 0;
    const results = answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      if (!question) {
        console.warn(`[SubmitQuestions] Question not found: ${a.questionId}`);
      }
      const isCorrect =
        question?.answer.toLowerCase() === a.answer.toLowerCase();
      if (isCorrect) correctCount++;
      return {
        questionId: a.questionId,
        userAnswer: a.answer,
        correctAnswer: question?.answer || "Unknown",
        isCorrect,
      };
    });

    const score =
      questions.length > 0
        ? Math.round((correctCount / questions.length) * 100)
        : 0;
    console.log(
      `[SubmitQuestions] Score: ${score} (${correctCount}/${questions.length})`,
    );

    // Update progress and mark as completed
    try {
      await this.prisma.vocabularyProgress.upsert({
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
