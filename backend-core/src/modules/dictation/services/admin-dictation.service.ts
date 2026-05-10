import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { AiClientService } from "../../ai-client/ai-client.service";
import { AdminCreateDictationLessonDto } from "../dto/admin-create-lesson.dto";
import { AdminUpdateDictationLessonDto } from "../dto/admin-update-lesson.dto";
import { AdminImportDictationYoutubeDto } from "../dto/admin-import-youtube.dto";

@Injectable()
export class AdminDictationService {
  constructor(
    private prisma: PrismaService,
    private aiClient: AiClientService,
  ) {}

  // Return ALL system lessons (userId = null), including non-READY ones
  async findAll() {
    return this.prisma.dictationVideo.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    const foundationVocabLesson = await this.prisma.dictationVideo.findFirst({
      where: { id, userId: null },
    });
    if (!foundationVocabLesson) throw new NotFoundException("System dictation foundationVocabLesson not found");
    return foundationVocabLesson;
  }

  async create(dto: AdminCreateDictationLessonDto) {
    return this.prisma.dictationVideo.create({
      data: {
        userId: null, // System foundationVocabLesson
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
  }

  async update(id: string, dto: AdminUpdateDictationLessonDto) {
    const foundationVocabLesson = await this.prisma.dictationVideo.findFirst({
      where: { id, userId: null },
    });
    if (!foundationVocabLesson) throw new NotFoundException("System dictation foundationVocabLesson not found");

    return this.prisma.dictationVideo.update({
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
  }

  async delete(id: string) {
    const foundationVocabLesson = await this.prisma.dictationVideo.findFirst({
      where: { id, userId: null },
    });
    if (!foundationVocabLesson) throw new NotFoundException("System dictation foundationVocabLesson not found");
    return this.prisma.dictationVideo.delete({ where: { id } });
  }

  async importYoutube(dto: AdminImportDictationYoutubeDto) {
    const youtubeIdMatch = dto.youtubeUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    const youtubeVideoId = youtubeIdMatch ? youtubeIdMatch[1] : null;

    const imageUrl = youtubeVideoId
      ? `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`
      : null;

    const video = await this.prisma.dictationVideo.create({
      data: {
        userId: null, // System foundationVocabLesson
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
    });

    return video;
  }
}
