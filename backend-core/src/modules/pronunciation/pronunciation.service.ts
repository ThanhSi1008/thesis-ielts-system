import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "@common/prisma/prisma.service";
import { RedisService } from "@common/redis/redis.service";
import {
  CreatePronunciationSoundDto,
  UpdatePronunciationSoundDto,
  PronunciationStatsDto,
  GetProgressResponseDto,
  WordProgressDto,
} from "./dto/pronunciation.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { GamificationService } from "../gamification/gamification.service";

const CACHE_TTL = 3600;
const CACHE_PREFIX = "pronunciation";

@Injectable()
export class PronunciationService {
  private readonly logger = new Logger(PronunciationService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private notifications: NotificationsService,
    private gamificationService: GamificationService,
  ) {}

  // ==================== READ OPERATIONS ====================

  async getAllSounds() {
    const cacheKey = `${CACHE_PREFIX}:sounds`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached;

    const sounds = await this.prisma.foundationPronunciationSound.findMany({
      orderBy: [{ type: "asc" }, { order: "asc" }],
      include: {
        exampleWords: {
          orderBy: { order: "asc" },
        },
      },
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

    const sound = await this.prisma.foundationPronunciationSound.findUnique({
      where: { symbol },
      include: {
        exampleWords: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (sound) await this.redis.setJson(cacheKey, sound, CACHE_TTL);
    return sound;
  }

  // ==================== SOUND CRUD ====================

  async createSound(dto: CreatePronunciationSoundDto) {
    const sound = await this.prisma.foundationPronunciationSound.create({ data: dto });
    await this.invalidateCache();
    return sound;
  }

  async updateSound(id: string, dto: UpdatePronunciationSoundDto) {
    const sound = await this.prisma.foundationPronunciationSound.update({
      where: { id },
      data: dto,
    });
    await this.invalidateCache();
    return sound;
  }

  async deleteSound(id: string) {
    await this.prisma.foundationPronunciationSound.delete({ where: { id } });
    await this.invalidateCache();
    return { message: "Pronunciation sound deleted successfully" };
  }

  // ==================== CACHE ====================

  async invalidateCache(pattern?: string) {
    await this.redis.delByPattern(pattern || `${CACHE_PREFIX}:*`);
  }

  // ==================== PROGRESS ====================

  async getUserProgress(userId: string): Promise<GetProgressResponseDto[]> {
    const cacheKey = `${CACHE_PREFIX}:progress:${userId}`;
    const cached = await this.redis.getJson(cacheKey);
    if (cached) return cached as GetProgressResponseDto[];

    // Get all sounds + user's progress
    const sounds = await this.prisma.foundationPronunciationSound.findMany({
      orderBy: [{ type: "asc" }, { order: "asc" }],
      select: { id: true, symbol: true, type: true },
    });

    const progressRecords = await this.prisma.foundationPronunciationProgress.findMany({
      where: { userId },
    });

    const progressMap = new Map(progressRecords.map(p => [p.soundId, p]));

    const ieltsIntensiveResult = sounds.map(sound => {
      const progress = progressMap.get(sound.id);
      return {
        soundId: sound.id,
        symbol: sound.symbol,
        type: sound.type,
        status: progress?.status ?? 'NEW',
        practiceCount: progress?.practiceCount ?? 0,
        bestScore: progress?.bestScore ?? null,
        lastPracticedAt: progress?.lastPracticedAt?.toISOString() ?? null,
      };
    });

    await this.redis.setJson(cacheKey, ieltsIntensiveResult, 300); // 5 min cache
    return ieltsIntensiveResult;
  }

  async getUserStats(userId: string): Promise<PronunciationStatsDto> {
    const progress = (await this.getUserProgress(userId)) as GetProgressResponseDto[];
    const totalSounds = progress.length;
    const masteredCount = progress.filter((p) => p.status === 'MASTERED').length;
    const practicingCount = progress.filter((p) => p.status === 'PRACTICING').length;
    const newCount = progress.filter((p) => p.status === 'NEW').length;

    return {
      totalSounds,
      masteredCount,
      practicingCount,
      newCount,
      overallMastery: totalSounds > 0 ? Math.round((masteredCount / totalSounds) * 100) : 0,
    };
  }

  async getWordProgress(userId: string, soundId: string): Promise<WordProgressDto[]> {
    // Get the example words for this sound
    const sound = await this.prisma.foundationPronunciationSound.findUnique({
      where: { id: soundId },
      select: { exampleWords: { select: { word: true } } },
    });

    if (!sound) return [];

    const wordList = sound.exampleWords.map(w => w.word.toLowerCase());

    // Aggregate best score + attempt count per targetWord from FoundationPronunciationAttempt
    const attempts = await this.prisma.foundationPronunciationAttempt.findMany({
      where: {
        userId,
        targetWord: { in: wordList },
        status: 'COMPLETED',
        score: { not: null },
      },
      select: { targetWord: true, score: true },
    });

    // Group attempts by word
    const grouped = new Map<string, { bestScore: number; count: number }>();
    for (const attempt of attempts) {
      const key = attempt.targetWord.toLowerCase();
      const existing = grouped.get(key);
      const score = attempt.score ?? 0;
      if (!existing) {
        grouped.set(key, { bestScore: score, count: 1 });
      } else {
        existing.bestScore = Math.max(existing.bestScore, score);
        existing.count += 1;
      }
    }

    const MASTERY_THRESHOLD = 80;

    return wordList.map(word => {
      const data = grouped.get(word);
      if (!data) return { word, bestScore: null, attemptCount: 0, status: 'NEW' as const };
      const status = data.bestScore >= MASTERY_THRESHOLD ? 'MASTERED' as const : 'PRACTICING' as const;
      return { word, bestScore: data.bestScore, attemptCount: data.count, status };
    });
  }

  async updateProgress(userId: string, soundId: string, accuracyScore: number) {
    const MASTERY_THRESHOLD = 80;
    const existingProgress = await this.prisma.foundationPronunciationProgress.findUnique({
      where: { userId_soundId: { userId, soundId } },
    });

    const newStatus = accuracyScore >= MASTERY_THRESHOLD ? 'MASTERED' : 'PRACTICING';

    const progress = await this.prisma.foundationPronunciationProgress.upsert({
      where: { userId_soundId: { userId, soundId } },
      create: {
        userId,
        soundId,
        status: newStatus,
        bestScore: accuracyScore,
        practiceCount: 1,
        lastPracticedAt: new Date(),
      },
      update: {
        status: newStatus,
        bestScore: {
          set: Math.max(existingProgress?.bestScore || 0, accuracyScore),
        },
        practiceCount: { increment: 1 },
        lastPracticedAt: new Date(),
      },
    });

    // Gamification
    this.gamificationService
      .onEvent(userId, {
        xp: 5,
        reason: "PRONUNCIATION_PRACTICE",
        achievementKeys: ["FP_FIRST_SOUND"],
      })
      .catch(() => {});

    if (newStatus === "MASTERED" && existingProgress?.status !== "MASTERED") {
      this.gamificationService
        .onEvent(userId, {
          xp: 10,
          reason: "PRONUNCIATION_MASTERY",
          achievementKeys: ["FP_SHARP_EAR", "FP_NATIVE"],
        })
        .catch(() => {});
    }

    // Invalidate user progress cache
    await this.redis.delByPattern(`${CACHE_PREFIX}:progress:${userId}`);

    return progress;
  }

  async createPronunciationAttempt(data: {
    userId: string;
    vocabularyId?: string;
    audioUrl: string;
    targetWord: string;
  }) {
    const attempt = await this.prisma.foundationPronunciationAttempt.create({
      data: {
        userId: data.userId,
        vocabularyId: data.vocabularyId,
        audioUrl: data.audioUrl,
        targetWord: data.targetWord,
        status: "PENDING",
      },
    });
    this.logger.log(`✅ Pronunciation attempt created: ${attempt.id}`);
    return attempt;
  }

  async updatePronunciationAttempt(
    attemptId: string,
    data: {
      transcribedText?: string;
      score?: number;
      feedback?: any;
      status?: string;
    },
  ) {
    const attempt = await this.prisma.foundationPronunciationAttempt.update({
      where: { id: attemptId },
      data: {
        transcribedText: data.transcribedText,
        score: data.score,
        feedback: data.feedback,
        status: data.status as any,
      },
    });
    this.logger.log(`✅ Pronunciation attempt updated: ${attemptId}`);
    return attempt;
  }

  async findUserPronunciationAttempts(userId: string) {
    return this.prisma.foundationPronunciationAttempt.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }
}
