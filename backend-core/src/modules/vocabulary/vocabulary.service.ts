import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';
import {
  CreateVocabularyBookDto,
  UpdateVocabularyBookDto,
  CreateVocabularyUnitDto,
  UpdateVocabularyUnitDto,
  CreateVocabularyWordDto,
  UpdateVocabularyWordDto,
} from './dto/vocabulary.dto';

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'vocabulary';

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
      orderBy: { order: 'asc' },
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
          orderBy: { order: 'asc' },
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
        words: { orderBy: { order: 'asc' } },
        exercises: { orderBy: { order: 'asc' } },
        questions: { orderBy: { order: 'asc' } },
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
    return { message: 'Book deleted successfully' };
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
    return { message: 'Unit deleted successfully' };
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
    return { message: 'Word deleted successfully' };
  }

  // ==================== CACHE ====================

  async invalidateCache(pattern?: string) {
    await this.redis.delByPattern(pattern || `${CACHE_PREFIX}:*`);
  }
}
