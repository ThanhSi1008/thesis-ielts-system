import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "@common/prisma/prisma.service";
import { RedisService } from "@common/redis/redis.service";
import {
  CreateGrammarBookDto,
  UpdateGrammarBookDto,
  CreateGrammarUnitDto,
  UpdateGrammarUnitDto,
  UpdateGrammarProgressDto,
} from "./dto/grammar.dto";
import { GamificationService } from "../gamification/gamification.service";

const CACHE_TTL = 3600;
const CACHE_PREFIX = "grammar";

@Injectable()
export class GrammarService {
  private readonly logger = new Logger(GrammarService.name);

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

    const books = await this.prisma.grammarBook.findMany({
      orderBy: { level: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        author: true,
        level: true,
        imageUrl: true,
        color: true,
        unitCount: true,
        _count: { select: { units: true } },
      },
    });

    await this.redis.setJson(cacheKey, books, CACHE_TTL);
    return books;
  }

  async getBookBySlug(slug: string) {
    const cacheKey = `${CACHE_PREFIX}:book:${slug}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const book = await this.prisma.grammarBook.findUnique({
      where: { slug },
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

    const unit = await this.prisma.grammarUnit.findUnique({
      where: { id: unitId },
      include: {
        book: { select: { id: true, slug: true, name: true } },
        exercises: { orderBy: { order: "asc" } },
      },
    });

    if (unit) await this.redis.setJson(cacheKey, unit, CACHE_TTL);
    return unit;
  }

  async getUnitByBookAndOrder(bookSlug: string, unitOrder: number) {
    const cacheKey = `${CACHE_PREFIX}:unit:${bookSlug}:${unitOrder}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const unit = await this.prisma.grammarUnit.findFirst({
      where: {
        book: { slug: bookSlug },
        order: unitOrder,
      },
      include: {
        book: { select: { id: true, slug: true, name: true, level: true, color: true } },
        exercises: { orderBy: { order: "asc" } },
      },
    });

    if (!unit) return null;

    // Parse exercise answer JSON strings into objects
    const parsedUnit = {
      ...unit,
      exercises: unit.exercises.map(ex => ({
        ...ex,
        items: this.parseExerciseAnswer(ex.answer),
        options: ex.options ?? null,
      })),
    };

    await this.redis.setJson(cacheKey, parsedUnit, CACHE_TTL);
    return parsedUnit;
  }

  private parseExerciseAnswer(answer: string): any[] {
    try {
      return JSON.parse(answer);
    } catch {
      return [];
    }
  }

  // ==================== BOOK CRUD ====================

  async createBook(dto: CreateGrammarBookDto) {
    const book = await this.prisma.grammarBook.create({ data: dto });
    await this.invalidateCache();
    return book;
  }

  async updateBook(id: string, dto: UpdateGrammarBookDto) {
    const book = await this.prisma.grammarBook.update({
      where: { id },
      data: dto,
    });
    await this.invalidateCache();
    return book;
  }

  async deleteBook(id: string) {
    await this.prisma.grammarBook.delete({ where: { id } });
    await this.invalidateCache();
    return { message: "Grammar book deleted successfully" };
  }

  // ==================== UNIT CRUD ====================

  async createUnit(dto: CreateGrammarUnitDto) {
    const unit = await this.prisma.grammarUnit.create({ data: dto });
    await this.invalidateCache();
    return unit;
  }

  async updateUnit(id: string, dto: UpdateGrammarUnitDto) {
    const unit = await this.prisma.grammarUnit.update({
      where: { id },
      data: dto,
    });
    await this.invalidateCache();
    return unit;
  }

  async deleteUnit(id: string) {
    await this.prisma.grammarUnit.delete({ where: { id } });
    await this.invalidateCache();
    return { message: "Grammar unit deleted successfully" };
  }

  // ==================== PROGRESS ====================

  async getProgress(userId: string, bookSlug: string) {
    const progress = await this.prisma.grammarProgress.findMany({
      where: {
        userId,
        unit: { book: { slug: bookSlug } },
      },
      select: {
        unitId: true,
        theoryCompleted: true,
        exerciseScore: true,
        exerciseTotal: true,
        completedAt: true,
        unit: { select: { order: true } },
      },
    });

    return progress.map(p => ({
      unitOrder: p.unit.order,
      theoryCompleted: p.theoryCompleted,
      exerciseScore: p.exerciseScore,
      exerciseTotal: p.exerciseTotal,
      isCompleted: p.theoryCompleted && p.exerciseScore != null && p.exerciseScore === p.exerciseTotal,
      completedAt: p.completedAt,
    }));
  }

  async updateProgress(
    userId: string,
    dto: UpdateGrammarProgressDto,
  ) {
    const existing = await this.prisma.grammarProgress.findUnique({
      where: { userId_unitId: { userId, unitId: dto.unitId } },
    });

    const isNowComplete =
      (dto.theoryCompleted ?? existing?.theoryCompleted ?? false) &&
      dto.exerciseScore != null &&
      dto.exerciseTotal != null &&
      dto.exerciseScore === dto.exerciseTotal;

    const progress = await this.prisma.grammarProgress.upsert({
      where: { userId_unitId: { userId, unitId: dto.unitId } },
      create: {
        userId,
        unitId: dto.unitId,
        theoryCompleted: dto.theoryCompleted ?? false,
        exerciseScore: dto.exerciseScore,
        exerciseTotal: dto.exerciseTotal,
        completedAt: isNowComplete ? new Date() : null,
      },
      update: {
        theoryCompleted: dto.theoryCompleted ?? undefined,
        exerciseScore: dto.exerciseScore ?? undefined,
        exerciseTotal: dto.exerciseTotal ?? undefined,
        completedAt: isNowComplete ? new Date() : undefined,
      },
    });

    if (isNowComplete && (!existing?.theoryCompleted || existing?.exerciseScore == null || existing.exerciseScore !== existing.exerciseTotal)) {
      this.gamificationService
        .onEvent(userId, {
          xp: 15,
          reason: "GRAMMAR_UNIT_COMPLETE",
          achievementKeys: ["FG_STARTER", "FG_GRADUATE"],
        })
        .catch(() => {});
    }

    return progress;
  }

  // ==================== CACHE ====================

  async invalidateCache(pattern?: string) {
    await this.redis.delByPattern(pattern || `${CACHE_PREFIX}:*`);
  }
}
