import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { UpsertProgressDto } from './dto/upsert-progress.dto';

@Injectable()
export class ShadowingService {
  constructor(private prisma: PrismaService) {}

  // ==================== VIDEOS ====================

  async getVideos(userId: string) {
    return this.prisma.shadowingVideo.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createVideo(userId: string, dto: CreateVideoDto) {
    return this.prisma.shadowingVideo.create({
      data: {
        userId,
        title: dto.title,
        youtubeVideoId: dto.youtubeVideoId,
        folder: dto.folder ?? 'All Videos',
        category: dto.category ?? 'Other',
        duration: dto.duration,
        sentences: dto.sentences as any,
      },
    });
  }

  async updateVideo(userId: string, videoId: string, dto: UpdateVideoDto) {
    const video = await this.prisma.shadowingVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
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

  async deleteVideo(userId: string, videoId: string) {
    const video = await this.prisma.shadowingVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    if (video.userId !== userId) throw new ForbiddenException();

    return this.prisma.shadowingVideo.delete({ where: { id: videoId } });
  }

  async getVideoById(userId: string, videoId: string) {
    const video = await this.prisma.shadowingVideo.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    if (video.userId !== userId) throw new ForbiddenException();
    return video;
  }

  // ==================== FOLDERS ====================

  async getFolders(userId: string) {
    const folders = await this.prisma.shadowingFolder.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
    return folders.map(f => f.name);
  }

  async createFolder(userId: string, name: string) {
    const existing = await this.prisma.shadowingFolder.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing) return existing;

    const count = await this.prisma.shadowingFolder.count({ where: { userId } });
    return this.prisma.shadowingFolder.create({
      data: { userId, name, order: count },
    });
  }

  async renameFolder(userId: string, oldName: string, newName: string) {
    // Rename the folder record
    const folder = await this.prisma.shadowingFolder.findUnique({
      where: { userId_name: { userId, name: oldName } },
    });
    if (!folder) throw new NotFoundException('Folder not found');

    // Update all videos in this folder
    await this.prisma.shadowingVideo.updateMany({
      where: { userId, folder: oldName },
      data: { folder: newName },
    });

    return this.prisma.shadowingFolder.update({
      where: { userId_name: { userId, name: oldName } },
      data: { name: newName },
    });
  }

  async deleteFolder(userId: string, name: string) {
    const folder = await this.prisma.shadowingFolder.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (!folder) throw new NotFoundException('Folder not found');

    // Move videos back to All Videos
    await this.prisma.shadowingVideo.updateMany({
      where: { userId, folder: name },
      data: { folder: 'All Videos' },
    });

    return this.prisma.shadowingFolder.delete({
      where: { userId_name: { userId, name } },
    });
  }

  // ==================== PROGRESS ====================

  async getProgress(userId: string, lessonId: string) {
    const rows = await this.prisma.shadowingDictationProgress.findMany({
      where: { userId, lessonId },
    });

    const shadowing = rows.find(r => r.type === 'shadowing');
    const dictation = rows.find(r => r.type === 'dictation');

    return {
      shadowing: {
        completedSentences: (shadowing?.completedSentences as number[]) ?? [],
      },
      dictation: {
        completedSentences: (dictation?.completedSentences as number[]) ?? [],
        difficulty: dictation?.dictationDifficulty ?? 'Intermediate',
      },
    };
  }

  async upsertProgress(userId: string, dto: UpsertProgressDto) {
    return this.prisma.shadowingDictationProgress.upsert({
      where: {
        userId_lessonId_type: {
          userId,
          lessonId: dto.lessonId,
          type: dto.type,
        },
      },
      update: {
        completedSentences: dto.completedSentences,
        ...(dto.dictationDifficulty !== undefined && { dictationDifficulty: dto.dictationDifficulty }),
      },
      create: {
        userId,
        lessonId: dto.lessonId,
        type: dto.type,
        completedSentences: dto.completedSentences,
        dictationDifficulty: dto.dictationDifficulty,
      },
    });
  }

  // Get progress for all lessons (for the main listing page)
  async getAllProgress(userId: string) {
    const rows = await this.prisma.shadowingDictationProgress.findMany({
      where: { userId },
    });

    // Group by lessonId
    const map: Record<string, { shadowing: number[]; dictation: number[] }> = {};
    for (const row of rows) {
      if (!map[row.lessonId]) map[row.lessonId] = { shadowing: [], dictation: [] };
      if (row.type === 'shadowing') map[row.lessonId].shadowing = row.completedSentences as number[];
      if (row.type === 'dictation') map[row.lessonId].dictation = row.completedSentences as number[];
    }
    return map;
  }
}
