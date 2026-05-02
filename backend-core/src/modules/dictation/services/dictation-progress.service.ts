import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { NotificationsService } from "../../notifications/notifications.service";
import { UpsertDictationProgressDto } from "../dto/upsert-dictation-progress.dto";

@Injectable()
export class DictationProgressService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
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

    // Notify when lesson is fully completed
    if (
      dto.totalSentences &&
      dto.completedSentences.length >= dto.totalSentences
    ) {
      const lessonTitle = dto.lessonTitle ?? dto.lessonId;
      this.notifications
        .notifyDictationComplete(userId, lessonTitle, dto.lessonId)
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
