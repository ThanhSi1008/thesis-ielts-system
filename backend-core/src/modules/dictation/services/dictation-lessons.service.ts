import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { SubscriptionsService } from "../../subscriptions/subscriptions.service";
import { TIER_LIMITS, TierKey } from "../../subscriptions/constants/feature-limits";

@Injectable()
export class DictationLessonsService {
  constructor(
    private prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(userId: string) {
    const tier = await this.subscriptionsService.getEffectiveTier(userId);
    const limit = TIER_LIMITS[tier].DICTATION_SYSTEM_LESSONS;

    let lessons = await this.prisma.dictationVideo.findMany({
      where: { userId: null },
      orderBy: { id: "asc" },
    });

    if (limit !== Infinity) {
      lessons = lessons.map((lesson, index) => ({
        ...lesson,
        isLocked: index >= (limit as number),
      }));
    }

    return lessons;
  }

  async findById(id: string) {
    const lesson = await this.prisma.dictationVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("Dictation lesson not found");
    return lesson;
  }
}
