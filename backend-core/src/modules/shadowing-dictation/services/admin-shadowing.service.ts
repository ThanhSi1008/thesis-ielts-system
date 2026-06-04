import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { RedisService } from "../../../common/redis/redis.service";
import { AiClientService } from "../../ai-client/ai-client.service";
import { AdminCreateLessonDto } from "../dto/admin-create-shadowing-lesson.dto";
import { AdminUpdateLessonDto } from "../dto/admin-update-shadowing-lesson.dto";
import { AdminImportYoutubeDto } from "../dto/admin-import-shadowing-youtube.dto";

@Injectable()
export class AdminShadowingService {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
    private readonly redis: RedisService,
  ) {}

  // Return ALL system lessons (userId = null), including non-READY ones
  async findAll() {
    return this.prisma.shadowingVideo.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const lesson = await this.prisma.shadowingVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System shadowing lesson not found");
    return lesson;
  }

  async create(dto: AdminCreateLessonDto) {
    const lesson = await this.prisma.shadowingVideo.create({
      data: {
        userId: null, // System lesson
        title: dto.title,
        youtubeVideoId: dto.youtubeVideoId ?? null,
        audioUrl: dto.audioUrl ?? null,
        imageUrl: dto.imageUrl ?? null,
        tags: dto.tags ?? [],
        folder: dto.folder ?? "All Videos",
        category: dto.category ?? "Other",
        duration: dto.duration,
        sentences: dto.sentences as any,
        status: "READY",
      },
    });

    // Invalidate Cache
    try {
      await this.redis.getClient().del("lessons:shadowing:all");
    } catch (err) {
      // Ignore Redis errors
    }

    return lesson;
  }

  async update(id: string, dto: AdminUpdateLessonDto) {
    const lesson = await this.prisma.shadowingVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System shadowing lesson not found");

    const updated = await this.prisma.shadowingVideo.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.youtubeVideoId !== undefined && { youtubeVideoId: dto.youtubeVideoId }),
        ...(dto.audioUrl !== undefined && { audioUrl: dto.audioUrl }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
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
      await this.redis.getClient().del("lessons:shadowing:all");
      await this.redis.getClient().del(`lesson:shadowing:${id}`);
    } catch (err) {
      // Ignore Redis errors
    }

    return updated;
  }

  async delete(id: string) {
    const lesson = await this.prisma.shadowingVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("System shadowing lesson not found");

    const deleted = await this.prisma.shadowingVideo.delete({ where: { id } });

    // Invalidate Cache
    try {
      await this.redis.getClient().del("lessons:shadowing:all");
      await this.redis.getClient().del(`lesson:shadowing:${id}`);
    } catch (err) {
      // Ignore Redis errors
    }

    return deleted;
  }

  async importYoutube(dto: AdminImportYoutubeDto) {
    const youtubeIdMatch = dto.youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})[\W]?/);
    const youtubeVideoId = youtubeIdMatch ? youtubeIdMatch[1] : null;

    const imageUrl = youtubeVideoId
      ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
      : null;

    const video = await this.prisma.shadowingVideo.create({
      data: {
        userId: null, // System lesson
        title: dto.title,
        youtubeVideoId,
        imageUrl,
        category: dto.category ?? "Other",
        folder: "All Videos",
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

    // Invalidate Cache
    try {
      await this.redis.getClient().del("lessons:shadowing:all");
    } catch (err) {
      // Ignore Redis errors
    }

    return video;
  }
}
