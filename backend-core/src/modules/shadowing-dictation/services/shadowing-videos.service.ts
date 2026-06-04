import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RedisService } from "../../../common/redis/redis.service";
import { CreateShadowingVideoDto } from "../dto/create-shadowing-video.dto";
import { UpdateShadowingVideoDto } from "../dto/update-shadowing-video.dto";
import { AiClientService } from "../../ai-client/ai-client.service";
import { SubscriptionsService } from "../../subscriptions/subscriptions.service";
import { NotificationsService } from "../../notifications/notifications.service";

@Injectable()
export class ShadowingVideosService {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationsService: NotificationsService,
    private readonly redis: RedisService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.shadowingVideo.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(userId: string, videoId: string) {
    const cacheKey = `video:shadowing:${videoId}`;
    let video: any;

    try {
      const cached = await this.redis.getClient().get(cacheKey);
      if (cached) {
        video = JSON.parse(cached);
      }
    } catch (err) {
      // Fallback if Redis fails
    }

    if (!video) {
      video = await this.prisma.shadowingVideo.findUnique({
        where: { id: videoId },
      });
      
      if (video) {
        try {
          await this.redis.getClient().set(cacheKey, JSON.stringify(video), "EX", 86400); // Cache for 24h
        } catch (err) {
          // Fallback if Redis fails
        }
      }
    }

    if (!video) throw new NotFoundException("Shadowing video not found");
    if (video.userId !== userId) throw new ForbiddenException();
    return video;
  }

  async create(userId: string, dto: CreateShadowingVideoDto) {
    const imageUrl = dto.youtubeVideoId
      ? `https://img.youtube.com/vi/${dto.youtubeVideoId}/hqdefault.jpg`
      : null;

    return this.prisma.shadowingVideo.create({
      data: {
        userId,
        title: dto.title,
        youtubeVideoId: dto.youtubeVideoId,
        imageUrl,
        folder: dto.folder ?? "All Videos",
        category: dto.category ?? "Other",
        duration: dto.duration,
        sentences: dto.sentences as any,
      },
    });
  }

  async update(userId: string, videoId: string, dto: UpdateShadowingVideoDto) {
    const video = await this.prisma.shadowingVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException("Shadowing video not found");
    if (video.userId !== userId) throw new ForbiddenException();

    const updated = await this.prisma.shadowingVideo.update({
      where: { id: videoId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.youtubeVideoId !== undefined && { youtubeVideoId: dto.youtubeVideoId }),
        ...(dto.audioUrl !== undefined && { audioUrl: dto.audioUrl }),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : (dto.youtubeVideoId !== undefined && {
          imageUrl: dto.youtubeVideoId ? `https://img.youtube.com/vi/${dto.youtubeVideoId}/hqdefault.jpg` : null
        })),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.folder !== undefined && { folder: dto.folder }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.sentences !== undefined && { sentences: dto.sentences as any }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });

    // Invalidate Cache
    try {
      const cacheKey = `video:shadowing:${videoId}`;
      await this.redis.getClient().del(cacheKey);
    } catch (err) {
      // Ignore Redis errors
    }

    return updated;
  }

  async delete(userId: string, videoId: string) {
    const video = await this.prisma.shadowingVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException("Shadowing video not found");
    if (video.userId !== userId) throw new ForbiddenException();

    const deleted = await this.prisma.shadowingVideo.delete({ where: { id: videoId } });

    // Invalidate Cache
    try {
      const cacheKey = `video:shadowing:${videoId}`;
      await this.redis.getClient().del(cacheKey);
    } catch (err) {
      // Ignore Redis errors
    }

    return deleted;
  }

  async importYoutube(userId: string, dto: { youtubeUrl: string; title: string; folder?: string }) {
    const hasAccess = await this.subscriptionsService.hasFeatureAccess(userId, "YOUTUBE_IMPORT");
    if (!hasAccess) {
      throw new ForbiddenException({
        statusCode: 403,
        error: "SUBSCRIPTION_REQUIRED",
        message: "YouTube import requires a Premium subscription",
        requiredTier: "PREMIUM",
        upgradeUrl: "/pricing",
      });
    }

    const youtubeIdMatch = dto.youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})[^\w-]?/);
    const youtubeVideoId = youtubeIdMatch ? youtubeIdMatch[1] : null;
    const imageUrl = youtubeVideoId
      ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
      : null;

    const video = await this.prisma.shadowingVideo.create({
      data: {
        userId,
        title: dto.title,
        youtubeVideoId,
        imageUrl,
        folder: dto.folder ?? "All Videos",
        category: "Other",
        duration: "0:00",
        sentences: [],
        status: "PROCESSING",
      },
    });

    await this.aiClient.publishTranscriptionTask({
      videoId: video.id,
      youtubeUrl: dto.youtubeUrl,
      type: "shadowing",
    } as any);

    return video;
  }

  async completeTranscription(videoId: string, dto: { sentences: any[]; duration: string }) {
    const video = await this.prisma.shadowingVideo.update({
      where: { id: videoId },
      data: {
        sentences: dto.sentences as any,
        duration: dto.duration,
        status: "READY",
      },
    });

    // Cache the completed video immediately (Write-Through)
    try {
      const cacheKey = video.userId
        ? `video:shadowing:${videoId}`
        : `lesson:shadowing:${videoId}`;
      const ttl = video.userId ? 86400 : 604800; // 24h for user video, 7 days for system lesson
      await this.redis.getClient().set(cacheKey, JSON.stringify(video), "EX", ttl);

      if (!video.userId) {
        await this.redis.getClient().del("lessons:shadowing:all");
      }
    } catch (err) {
      // Ignore Redis errors
    }

    if (video.userId) {
      this.notificationsService
        .notifySystemAnnouncement(
          video.userId,
          "Shadowing video is ready",
          `"${video.title}" has finished processing and is ready to practice.`,
          `/shadowing-dictation/shadowing/${video.id}`,
        )
        .catch(() => {});
    }

    return video;
  }

  async markTranscriptionFailed(videoId: string, error?: string | null) {
    const video = await this.prisma.shadowingVideo.update({
      where: { id: videoId },
      data: {
        status: "FAILED",
        sentences: [{ error: error || "Transcription failed" }] as any,
      },
    });

    // Invalidate Cache
    try {
      const cacheKey = video.userId
        ? `video:shadowing:${videoId}`
        : `lesson:shadowing:${videoId}`;
      await this.redis.getClient().del(cacheKey);

      if (!video.userId) {
        await this.redis.getClient().del("lessons:shadowing:all");
      }
    } catch (err) {
      // Ignore Redis errors
    }

    if (video.userId) {
      this.notificationsService
        .notifySystemAnnouncement(
          video.userId,
          "Shadowing video processing failed",
          `"${video.title}" could not be processed. Please try another video.`,
          "/shadowing-dictation/shadowing/my-videos",
        )
        .catch(() => {});
    }

    return video;
  }
}
