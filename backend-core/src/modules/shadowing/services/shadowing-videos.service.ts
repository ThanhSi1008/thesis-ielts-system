import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateShadowingVideoDto } from "../dto/create-shadowing-video.dto";
import { UpdateShadowingVideoDto } from "../dto/update-shadowing-video.dto";
import { AiClientService } from "../../ai-client/ai-client.service";
import { SubscriptionsService } from "../../subscriptions/subscriptions.service";

@Injectable()
export class ShadowingVideosService {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.shadowingVideo.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(userId: string, videoId: string) {
    const video = await this.prisma.shadowingVideo.findUnique({
      where: { id: videoId },
    });
    if (!video) throw new NotFoundException("Shadowing video not found");
    if (video.userId !== userId) throw new ForbiddenException();
    return video;
  }

  async create(userId: string, dto: CreateShadowingVideoDto) {
    return this.prisma.shadowingVideo.create({
      data: {
        userId,
        title: dto.title,
        youtubeVideoId: dto.youtubeVideoId,
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

    return this.prisma.shadowingVideo.update({
      where: { id: videoId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.folder !== undefined && { folder: dto.folder }),
        ...(dto.category !== undefined && { category: dto.category }),
      },
    });
  }

  async delete(userId: string, videoId: string) {
    const video = await this.prisma.shadowingVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException("Shadowing video not found");
    if (video.userId !== userId) throw new ForbiddenException();
    return this.prisma.shadowingVideo.delete({ where: { id: videoId } });
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

    const video = await this.prisma.shadowingVideo.create({
      data: {
        userId,
        title: dto.title,
        youtubeVideoId,
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
    return this.prisma.shadowingVideo.update({
      where: { id: videoId },
      data: {
        sentences: dto.sentences as any,
        duration: dto.duration,
        status: "READY",
      },
    });
  }
}
