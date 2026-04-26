import { Injectable } from "@nestjs/common";
import { PrismaService } from "@common/prisma/prisma.service";
import { RedisService } from "@common/redis/redis.service";
import {
  CreatePronunciationSoundDto,
  UpdatePronunciationSoundDto,
} from "./dto/pronunciation.dto";

const CACHE_TTL = 3600;
const CACHE_PREFIX = "pronunciation";

@Injectable()
export class PronunciationService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ==================== READ OPERATIONS ====================

  async getAllSounds() {
    const cacheKey = `${CACHE_PREFIX}:sounds`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const sounds = await this.prisma.pronunciationSound.findMany({
      orderBy: [{ type: "asc" }, { order: "asc" }],
    });

    const grouped = {
      monophthongs: sounds.filter((s) => s.type === "monophthong"),
      diphthongs: sounds.filter((s) => s.type === "diphthong"),
      consonants: sounds.filter((s) => s.type === "consonant"),
    };

    await this.redis.setJson(cacheKey, grouped, CACHE_TTL);
    return grouped;
  }

  async getSoundBySymbol(symbol: string) {
    const cacheKey = `${CACHE_PREFIX}:sound:${symbol}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const sound = await this.prisma.pronunciationSound.findUnique({
      where: { symbol },
    });

    if (sound) await this.redis.setJson(cacheKey, sound, CACHE_TTL);
    return sound;
  }

  // ==================== SOUND CRUD ====================

  async createSound(dto: CreatePronunciationSoundDto) {
    const sound = await this.prisma.pronunciationSound.create({ data: dto });
    await this.invalidateCache();
    return sound;
  }

  async updateSound(id: string, dto: UpdatePronunciationSoundDto) {
    const sound = await this.prisma.pronunciationSound.update({
      where: { id },
      data: dto,
    });
    await this.invalidateCache();
    return sound;
  }

  async deleteSound(id: string) {
    await this.prisma.pronunciationSound.delete({ where: { id } });
    await this.invalidateCache();
    return { message: "Pronunciation sound deleted successfully" };
  }

  // ==================== CACHE ====================

  async invalidateCache(pattern?: string) {
    await this.redis.delByPattern(pattern || `${CACHE_PREFIX}:*`);
  }
}
