import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/prisma/prisma.service';
import { RedisService } from '@common/redis/redis.service';
import {
  CreateGrammarBookDto,
  UpdateGrammarBookDto,
  CreateGrammarUnitDto,
  UpdateGrammarUnitDto,
} from './dto/grammar.dto';

const CACHE_TTL = 3600;
const CACHE_PREFIX = 'grammar';

@Injectable()
export class GrammarService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ==================== READ OPERATIONS ====================

  async getBooks() {
    const cacheKey = `${CACHE_PREFIX}:books`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const books = await this.prisma.grammarBook.findMany({
      orderBy: { level: 'asc' },
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

    const unit = await this.prisma.grammarUnit.findUnique({
      where: { id: unitId },
      include: {
        book: { select: { id: true, slug: true, name: true } },
        exercises: { orderBy: { order: 'asc' } },
      },
    });

    if (unit) await this.redis.setJson(cacheKey, unit, CACHE_TTL);
    return unit;
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
    return { message: 'Grammar book deleted successfully' };
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
    return { message: 'Grammar unit deleted successfully' };
  }

  // ==================== CACHE ====================

  async invalidateCache(pattern?: string) {
    await this.redis.delByPattern(pattern || `${CACHE_PREFIX}:*`);
  }
}
