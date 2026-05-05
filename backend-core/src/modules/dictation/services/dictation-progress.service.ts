import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { NotificationsService } from "../../notifications/notifications.service";
import { UpsertDictationProgressDto } from "../dto/upsert-dictation-progress.dto";

import { GamificationService } from "../../gamification/gamification.service";

@Injectable()
export class DictationProgressService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private gamificationService: GamificationService,
  ) {}

  async findByLesson(userId: string, lessonId: string) {
    const row = await this.prisma.dictationProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    return {
      completedSentences: (row?.completedSentences as number[]) ?? [],
      difficulty: row?.difficulty ?? "Intermediate",
    };
  }

  async upsert(userId: string, dto: UpsertDictationProgressDto) {
    const result = await this.prisma.dictationProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: dto.lessonId } },
      update: {
        completedSentences: dto.completedSentences,
        ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
      },
      create: {
        userId,
        lessonId: dto.lessonId,
        completedSentences: dto.completedSentences,
        difficulty: dto.difficulty ?? "Intermediate",
      },
    });

    const existing = await this.prisma.dictationProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: dto.lessonId } },
    });
    const existingCount = existing?.completedSentences ? (existing.completedSentences as number[]).length : 0;
    const newCount = dto.completedSentences.length;

    // Notify when lesson is fully completed
    const isNowCompleted = dto.totalSentences && dto.completedSentences.length >= dto.totalSentences;
    const wasAlreadyCompleted = existingCount >= (dto.totalSentences || Infinity);

    if (isNowCompleted && !wasAlreadyCompleted) {
      const lessonTitle = dto.lessonTitle ?? dto.lessonId;
      this.notifications
        .notifyDictationComplete(userId, lessonTitle, dto.lessonId)
        .catch(() => {});
        
      const achievementKeys = ["DI_FIRST", "DI_REGULAR"];
      if (dto.difficulty === "Expert") achievementKeys.push("DI_EXPERT");

      this.gamificationService
        .onEvent(userId, {
          xp: 15,
          reason: "DICTATION_LESSON_COMPLETE",
          achievementKeys,
        })
        .catch(() => {});
    }

    if (newCount > existingCount) {
      this.gamificationService
        .onEvent(userId, {
          xp: 2 * (newCount - existingCount),
          reason: "DICTATION_SENTENCE",
        })
        .catch(() => {});
    }

    return result;
  }

  async findAllByUser(userId: string) {
    const rows = await this.prisma.dictationProgress.findMany({
      where: { userId },
    });

    // Returns: { lessonId: { completedSentences: [], difficulty: "..." } }
    const map: Record<string, { completedSentences: number[]; difficulty: string }> = {};
    for (const row of rows) {
      map[row.lessonId] = {
        completedSentences: row.completedSentences as number[],
        difficulty: row.difficulty,
      };
    }
    return map;
  }
}
