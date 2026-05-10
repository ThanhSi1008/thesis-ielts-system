import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { UpsertShadowingProgressDto } from "../dto/upsert-shadowing-progress.dto";

import { GamificationService } from "../../gamification/gamification.service";

@Injectable()
export class ShadowingProgressService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  async findByLesson(userId: string, lessonId: string) {
    const row = await this.prisma.shadowingProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    return {
      completedSentences: (row?.completedSentences as number[]) ?? [],
    };
  }

  async upsert(userId: string, dto: UpsertShadowingProgressDto) {
    const existing = await this.prisma.shadowingProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: dto.lessonId } },
    });

    const existingCount = existing?.completedSentences ? (existing.completedSentences as number[]).length : 0;
    const newCount = dto.completedSentences.length;

    const progress = await this.prisma.shadowingProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: dto.lessonId } },
      update: {
        completedSentences: dto.completedSentences,
      },
      create: {
        userId,
        lessonId: dto.lessonId,
        completedSentences: dto.completedSentences,
      },
    });

    if (newCount > existingCount) {
      this.gamificationService
        .onEvent(userId, {
          xp: 2 * (newCount - existingCount),
          reason: "SHADOWING_SENTENCE",
        })
        .catch(() => {});
    }

    // Check if video exists and is fully completed
    if (newCount > 0 && newCount > existingCount) {
      const video = await this.prisma.shadowingVideo.findUnique({
        where: { id: dto.lessonId },
        select: { sentences: true },
      });
      if (video && Array.isArray(video.sentences) && newCount >= video.sentences.length) {
        this.gamificationService
          .onEvent(userId, {
            xp: 15,
            reason: "SHADOWING_LESSON_COMPLETE",
            achievementKeys: ["SH_ECHO", "SH_PARROT", "SH_VOICE_ACTOR"],
          })
          .catch(() => {});
      }
    }

    return progress;
  }

  async findAllByUser(userId: string) {
    const rows = await this.prisma.shadowingProgress.findMany({
      where: { userId },
    });

    // Returns: { lessonId: completedSentences[] }
    const map: Record<string, number[]> = {};
    for (const row of rows) {
      map[row.lessonId] = row.completedSentences as number[];
    }
    return map;
  }
}
