import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RedisService } from "../../../common/redis/redis.service";
import { SubscriptionsService } from "../../subscriptions/subscriptions.service";
import { TIER_LIMITS, TierKey } from "../../subscriptions/constants/feature-limits";

@Injectable()
export class ShadowingLessonsService {
  constructor(
    private prisma: PrismaService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly redis: RedisService,
  ) {}

  async findAll(userId: string) {
    const tier = await this.subscriptionsService.getEffectiveTier(userId);
    const limit = TIER_LIMITS[tier].SHADOWING_SYSTEM_LESSONS;

    const cacheKey = "lessons:shadowing:all";
    let lessons: any[] | null = null;

    try {
      const cached = await this.redis.getClient().get(cacheKey);
      if (cached) {
        lessons = JSON.parse(cached);
      }
    } catch (err) {
      // Ignore Redis errors
    }

    if (!lessons) {
      lessons = await this.prisma.shadowingVideo.findMany({
        where: { userId: null },
        orderBy: { id: "asc" },
      });

      try {
        await this.redis.getClient().set(cacheKey, JSON.stringify(lessons), "EX", 604800); // Cache for 7 days
      } catch (err) {
        // Ignore Redis errors
      }
    }

    if (limit !== Infinity) {
      lessons = lessons.map((lesson, index) => ({
        ...lesson,
        isLocked: index >= (limit as number),
      }));
    }

    return lessons;
  }

  async findById(id: string) {
    const cacheKey = `lesson:shadowing:${id}`;
    let lesson: any = null;

    try {
      const cached = await this.redis.getClient().get(cacheKey);
      if (cached) {
        lesson = JSON.parse(cached);
      }
    } catch (err) {
      // Ignore Redis errors
    }

    if (!lesson) {
      lesson = await this.prisma.shadowingVideo.findFirst({
        where: { id, userId: null },
      });
      if (!lesson) throw new NotFoundException("Shadowing lesson not found");

      try {
        await this.redis.getClient().set(cacheKey, JSON.stringify(lesson), "EX", 604800); // Cache for 7 days
      } catch (err) {
        // Ignore Redis errors
      }
    }

    return lesson;
  }
}
