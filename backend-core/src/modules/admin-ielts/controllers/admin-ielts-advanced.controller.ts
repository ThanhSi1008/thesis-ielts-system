import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { AdminAuditLogService } from "../services/admin-audit-log.service";
import { StorageService } from "../../../common/storage/storage.service";

@Controller("admin/ielts/advanced")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminIeltsAdvancedController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AdminAuditLogService,
    private readonly storageService: StorageService
  ) {}

  // ============================================================
  // ADVANCED LISTENING PARTS
  // ============================================================

  @Get("listening")
  async findListening() {
    return this.prisma.ieltsAdvancedListeningPart.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("listening/:id")
  async findListeningOne(@Param("id") id: string) {
    const part = await this.prisma.ieltsAdvancedListeningPart.findUnique({
      where: { id },
    });
    if (!part) throw new NotFoundException(`Listening part ${id} not found.`);
    return part;
  }

  @Post("listening")
  async createListening(@Body() body: any, @Request() req: any) {
    const created = await this.prisma.ieltsAdvancedListeningPart.create({
      data: {
        title: body.title,
        partNumber: Number(body.partNumber),
        audioUrl: body.audioUrl || "",
        transcript: body.transcript || {},
        content: body.content || {},
        questionTypes: body.questionTypes || [],
        source: body.source || "manual",
        bookNumber: body.bookNumber !== undefined ? Number(body.bookNumber) : null,
        testNumber: body.testNumber !== undefined ? Number(body.testNumber) : null,
        isPublished: body.isPublished || false,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "CREATE",
      "ADVANCED_LISTENING_PART",
      created.id,
      { title: created.title, partNumber: created.partNumber }
    );

    return created;
  }

  @Patch("listening/:id")
  async updateListening(@Param("id") id: string, @Body() body: any, @Request() req: any) {
    const updated = await this.prisma.ieltsAdvancedListeningPart.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        audioUrl: body.audioUrl !== undefined ? body.audioUrl : undefined,
        isPublished: body.isPublished !== undefined ? body.isPublished : undefined,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "UPDATE",
      "ADVANCED_LISTENING_PART",
      updated.id,
      { title: updated.title, partNumber: updated.partNumber, isPublished: updated.isPublished }
    );

    return updated;
  }

  @Delete("listening/:id")
  async removeListening(@Param("id") id: string, @Request() req: any) {
    const part = await this.prisma.ieltsAdvancedListeningPart.findUnique({
      where: { id },
    });
    if (!part) throw new NotFoundException(`Listening part ${id} not found.`);

    let mediaCleared = 0;
    if (part.importJobId) {
      const importJob = await this.prisma.contentImportJob.findUnique({
        where: { id: part.importJobId },
      });

      if (importJob && importJob.mediaAssets) {
        const assets = importJob.mediaAssets as any[];
        for (const asset of assets) {
          if (asset.storedUrl) {
            try {
              await this.storageService.deleteFile(asset.storedUrl);
              mediaCleared++;
            } catch (err) {
              console.error(`[Rollback Media Cleanup] Failed to delete file: ${asset.storedUrl}. Error: ${err.message}`);
            }
          }
        }
      }
    }

    await this.prisma.ieltsAdvancedListeningPart.delete({
      where: { id },
    });

    await this.auditLogService.log(
      req.user.id,
      "DELETE",
      "ADVANCED_LISTENING_PART",
      id,
      { title: part.title, partNumber: part.partNumber, importJobId: part.importJobId, mediaCleared }
    );

    return { success: true, message: `Listening part deleted successfully. Cleared ${mediaCleared} media assets.` };
  }

  @Patch("listening/:id/publish")
  async publishListening(@Param("id") id: string, @Request() req: any) {
    const updated = await this.prisma.ieltsAdvancedListeningPart.update({
      where: { id },
      data: { isPublished: true },
    });

    await this.auditLogService.log(
      req.user.id,
      "PUBLISH",
      "ADVANCED_LISTENING_PART",
      updated.id,
      { title: updated.title, partNumber: updated.partNumber }
    );

    return updated;
  }

  // ============================================================
  // ADVANCED READING PARTS
  // ============================================================

  @Get("reading")
  async findReading() {
    return this.prisma.ieltsAdvancedReadingPart.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("reading/:id")
  async findReadingOne(@Param("id") id: string) {
    const part = await this.prisma.ieltsAdvancedReadingPart.findUnique({
      where: { id },
    });
    if (!part) throw new NotFoundException(`Reading part ${id} not found.`);
    return part;
  }

  @Post("reading")
  async createReading(@Body() body: any, @Request() req: any) {
    const created = await this.prisma.ieltsAdvancedReadingPart.create({
      data: {
        title: body.title,
        partNumber: Number(body.partNumber),
        passage: body.passage || "",
        passageWithLocations: body.passageWithLocations || {},
        content: body.content || {},
        questionTypes: body.questionTypes || [],
        source: body.source || "manual",
        bookNumber: body.bookNumber !== undefined ? Number(body.bookNumber) : null,
        testNumber: body.testNumber !== undefined ? Number(body.testNumber) : null,
        isPublished: body.isPublished || false,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "CREATE",
      "ADVANCED_READING_PART",
      created.id,
      { title: created.title, partNumber: created.partNumber }
    );

    return created;
  }

  @Patch("reading/:id")
  async updateReading(@Param("id") id: string, @Body() body: any, @Request() req: any) {
    const updated = await this.prisma.ieltsAdvancedReadingPart.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        passage: body.passage !== undefined ? body.passage : undefined,
        isPublished: body.isPublished !== undefined ? body.isPublished : undefined,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "UPDATE",
      "ADVANCED_READING_PART",
      updated.id,
      { title: updated.title, partNumber: updated.partNumber, isPublished: updated.isPublished }
    );

    return updated;
  }

  @Delete("reading/:id")
  async removeReading(@Param("id") id: string, @Request() req: any) {
    const part = await this.prisma.ieltsAdvancedReadingPart.findUnique({
      where: { id },
    });
    if (!part) throw new NotFoundException(`Reading part ${id} not found.`);

    let mediaCleared = 0;
    if (part.importJobId) {
      const importJob = await this.prisma.contentImportJob.findUnique({
        where: { id: part.importJobId },
      });

      if (importJob && importJob.mediaAssets) {
        const assets = importJob.mediaAssets as any[];
        for (const asset of assets) {
          if (asset.storedUrl) {
            try {
              await this.storageService.deleteFile(asset.storedUrl);
              mediaCleared++;
            } catch (err) {
              console.error(`[Rollback Media Cleanup] Failed to delete file: ${asset.storedUrl}. Error: ${err.message}`);
            }
          }
        }
      }
    }

    await this.prisma.ieltsAdvancedReadingPart.delete({
      where: { id },
    });

    await this.auditLogService.log(
      req.user.id,
      "DELETE",
      "ADVANCED_READING_PART",
      id,
      { title: part.title, partNumber: part.partNumber, importJobId: part.importJobId, mediaCleared }
    );

    return { success: true, message: `Reading part deleted successfully. Cleared ${mediaCleared} media assets.` };
  }

  @Patch("reading/:id/publish")
  async publishReading(@Param("id") id: string, @Request() req: any) {
    const updated = await this.prisma.ieltsAdvancedReadingPart.update({
      where: { id },
      data: { isPublished: true },
    });

    await this.auditLogService.log(
      req.user.id,
      "PUBLISH",
      "ADVANCED_READING_PART",
      updated.id,
      { title: updated.title, partNumber: updated.partNumber }
    );

    return updated;
  }

  // ============================================================
  // ADVANCED WRITING PROMPTS
  // ============================================================

  @Get("writing")
  async findWriting() {
    return this.prisma.ieltsAdvancedWritingPrompt.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("writing/:id")
  async findWritingOne(@Param("id") id: string) {
    const prompt = await this.prisma.ieltsAdvancedWritingPrompt.findUnique({
      where: { id },
    });
    if (!prompt) throw new NotFoundException(`Writing prompt ${id} not found.`);
    return prompt;
  }

  @Post("writing")
  async createWriting(@Body() body: any, @Request() req: any) {
    const created = await this.prisma.ieltsAdvancedWritingPrompt.create({
      data: {
        taskType: body.taskType || "TASK_1",
        subType: body.subType || "essay",
        source: body.source || "manual",
        category: body.category || "cambridge-academic",
        bookNumber: body.bookNumber !== undefined ? Number(body.bookNumber) : null,
        testNumber: body.testNumber !== undefined ? Number(body.testNumber) : null,
        title: body.title,
        prompt: body.prompt || "",
        imageUrl: body.imageUrl || null,
        minimumWords: body.minimumWords ? Number(body.minimumWords) : 150,
        suggestedTime: body.suggestedTime ? Number(body.suggestedTime) : 20,
        difficulty: body.difficulty || "medium",
        engnovateSlug: body.engnovateSlug || null,
        isPublished: body.isPublished || false,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "CREATE",
      "ADVANCED_WRITING_PROMPT",
      created.id,
      { title: created.title, taskType: created.taskType }
    );

    return created;
  }

  @Patch("writing/:id")
  async updateWriting(@Param("id") id: string, @Body() body: any, @Request() req: any) {
    const updated = await this.prisma.ieltsAdvancedWritingPrompt.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        prompt: body.prompt !== undefined ? body.prompt : undefined,
        isPublished: body.isPublished !== undefined ? body.isPublished : undefined,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "UPDATE",
      "ADVANCED_WRITING_PROMPT",
      updated.id,
      { title: updated.title, taskType: updated.taskType, isPublished: updated.isPublished }
    );

    return updated;
  }

  @Delete("writing/:id")
  async removeWriting(@Param("id") id: string, @Request() req: any) {
    const prompt = await this.prisma.ieltsAdvancedWritingPrompt.findUnique({
      where: { id },
    });
    if (!prompt) throw new NotFoundException(`Writing prompt ${id} not found.`);

    let mediaCleared = 0;
    if (prompt.importJobId) {
      const importJob = await this.prisma.contentImportJob.findUnique({
        where: { id: prompt.importJobId },
      });

      if (importJob && importJob.mediaAssets) {
        const assets = importJob.mediaAssets as any[];
        for (const asset of assets) {
          if (asset.storedUrl) {
            try {
              await this.storageService.deleteFile(asset.storedUrl);
              mediaCleared++;
            } catch (err) {
              console.error(`[Rollback Media Cleanup] Failed to delete file: ${asset.storedUrl}. Error: ${err.message}`);
            }
          }
        }
      }
    }

    await this.prisma.ieltsAdvancedWritingPrompt.delete({
      where: { id },
    });

    await this.auditLogService.log(
      req.user.id,
      "DELETE",
      "ADVANCED_WRITING_PROMPT",
      id,
      { title: prompt.title, importJobId: prompt.importJobId, mediaCleared }
    );

    return { success: true, message: `Writing prompt deleted successfully. Cleared ${mediaCleared} media assets.` };
  }

  @Patch("writing/:id/publish")
  async publishWriting(@Param("id") id: string, @Request() req: any) {
    const updated = await this.prisma.ieltsAdvancedWritingPrompt.update({
      where: { id },
      data: { isPublished: true },
    });

    await this.auditLogService.log(
      req.user.id,
      "PUBLISH",
      "ADVANCED_WRITING_PROMPT",
      updated.id,
      { title: updated.title, taskType: updated.taskType }
    );

    return updated;
  }

  // ============================================================
  // ADVANCED SPEAKING PARTS
  // ============================================================

  @Get("speaking")
  async findSpeaking() {
    return this.prisma.ieltsAdvancedSpeakingPart.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  @Get("speaking/:id")
  async findSpeakingOne(@Param("id") id: string) {
    const part = await this.prisma.ieltsAdvancedSpeakingPart.findUnique({
      where: { id },
    });
    if (!part) throw new NotFoundException(`Speaking part ${id} not found.`);
    return part;
  }

  @Post("speaking")
  async createSpeaking(@Body() body: any, @Request() req: any) {
    const created = await this.prisma.ieltsAdvancedSpeakingPart.create({
      data: {
        partNumber: Number(body.partNumber || 1),
        partType: body.partType || "interview",
        topic: body.topic || "",
        source: body.source || "manual",
        category: body.category || "cambridge-academic",
        bookNumber: body.bookNumber !== undefined ? Number(body.bookNumber) : null,
        testNumber: body.testNumber !== undefined ? Number(body.testNumber) : null,
        title: body.title,
        questions: body.questions || [],
        engnovateSlug: body.engnovateSlug || null,
        isPublished: body.isPublished || false,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "CREATE",
      "ADVANCED_SPEAKING_PART",
      created.id,
      { title: created.title, partNumber: created.partNumber }
    );

    return created;
  }

  @Patch("speaking/:id")
  async updateSpeaking(@Param("id") id: string, @Body() body: any, @Request() req: any) {
    const updated = await this.prisma.ieltsAdvancedSpeakingPart.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        topic: body.topic !== undefined ? body.topic : undefined,
        isPublished: body.isPublished !== undefined ? body.isPublished : undefined,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "UPDATE",
      "ADVANCED_SPEAKING_PART",
      updated.id,
      { title: updated.title, partNumber: updated.partNumber, isPublished: updated.isPublished }
    );

    return updated;
  }

  @Delete("speaking/:id")
  async removeSpeaking(@Param("id") id: string, @Request() req: any) {
    const part = await this.prisma.ieltsAdvancedSpeakingPart.findUnique({
      where: { id },
    });
    if (!part) throw new NotFoundException(`Speaking part ${id} not found.`);

    let mediaCleared = 0;
    if (part.importJobId) {
      const importJob = await this.prisma.contentImportJob.findUnique({
        where: { id: part.importJobId },
      });

      if (importJob && importJob.mediaAssets) {
        const assets = importJob.mediaAssets as any[];
        for (const asset of assets) {
          if (asset.storedUrl) {
            try {
              await this.storageService.deleteFile(asset.storedUrl);
              mediaCleared++;
            } catch (err) {
              console.error(`[Rollback Media Cleanup] Failed to delete file: ${asset.storedUrl}. Error: ${err.message}`);
            }
          }
        }
      }
    }

    await this.prisma.ieltsAdvancedSpeakingPart.delete({
      where: { id },
    });

    await this.auditLogService.log(
      req.user.id,
      "DELETE",
      "ADVANCED_SPEAKING_PART",
      id,
      { title: part.title, partNumber: part.partNumber, importJobId: part.importJobId, mediaCleared }
    );

    return { success: true, message: `Speaking part deleted successfully. Cleared ${mediaCleared} media assets.` };
  }

  @Patch("speaking/:id/publish")
  async publishSpeaking(@Param("id") id: string, @Request() req: any) {
    const updated = await this.prisma.ieltsAdvancedSpeakingPart.update({
      where: { id },
      data: { isPublished: true },
    });

    await this.auditLogService.log(
      req.user.id,
      "PUBLISH",
      "ADVANCED_SPEAKING_PART",
      updated.id,
      { title: updated.title, partNumber: updated.partNumber }
    );

    return updated;
  }
}
