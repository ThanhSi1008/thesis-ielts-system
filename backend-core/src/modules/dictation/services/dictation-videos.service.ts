import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateDictationVideoDto } from "../dto/create-dictation-video.dto";
import { UpdateDictationVideoDto } from "../dto/update-dictation-video.dto";
import { AiClientService } from "../../ai-client/ai-client.service";
import { SubscriptionsService } from "../../subscriptions/subscriptions.service";

@Injectable()
export class DictationVideosService {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.dictationVideo.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findById(userId: string, videoId: string) {
    const video = await this.prisma.dictationVideo.findUnique({
      where: { id: videoId },
    });
    if (!video) throw new NotFoundException("Dictation video not found");
    if (video.userId !== userId) throw new ForbiddenException();
    return video;
  }

  async create(userId: string, dto: CreateDictationVideoDto) {
    return this.prisma.dictationVideo.create({
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

  async update(userId: string, videoId: string, dto: UpdateDictationVideoDto) {
    const video = await this.prisma.dictationVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException("Dictation video not found");
    if (video.userId !== userId) throw new ForbiddenException();

    return this.prisma.dictationVideo.update({
      where: { id: videoId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.folder !== undefined && { folder: dto.folder }),
        ...(dto.category !== undefined && { category: dto.category }),
      },
    });
  }

  async delete(userId: string, videoId: string) {
    const video = await this.prisma.dictationVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException("Dictation video not found");
    if (video.userId !== userId) throw new ForbiddenException();
    return this.prisma.dictationVideo.delete({ where: { id: videoId } });
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

    const youtubeIdMatch = dto.youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    const youtubeVideoId = youtubeIdMatch ? youtubeIdMatch[1] : null;

    const video = await this.prisma.dictationVideo.create({
      data: {
        userId,
        title: dto.title,
        youtubeVideoId: youtubeVideoId,
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
    });

    return video;
  }

  async completeTranscription(videoId: string, dto: { sentences: any[]; duration: string }) {
    return this.prisma.dictationVideo.update({
      where: { id: videoId },
      data: {
        sentences: dto.sentences as any,
        duration: dto.duration,
        status: "READY",
      },
    });
  }
}
