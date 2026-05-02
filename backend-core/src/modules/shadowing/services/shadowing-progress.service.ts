import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { UpsertShadowingProgressDto } from "../dto/upsert-shadowing-progress.dto";

@Injectable()
export class ShadowingProgressService {
  constructor(private prisma: PrismaService) {}

  async findByLesson(userId: string, lessonId: string) {
    const row = await this.prisma.shadowingProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    return {
      completedSentences: (row?.completedSentences as number[]) ?? [],
    };
  }

  async upsert(userId: string, dto: UpsertShadowingProgressDto) {
    return this.prisma.shadowingProgress.upsert({
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
