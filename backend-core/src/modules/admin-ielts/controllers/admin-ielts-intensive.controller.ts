import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  NotFoundException,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { CreateExamDto, UpdateExamDto } from "../../exams/dto/exams.dto";
import { IeltsIntensiveExamType } from "@prisma/client";
import { AdminAuditLogService } from "../services/admin-audit-log.service";
import { StorageService } from "../../../common/storage/storage.service";

@Controller("admin/ielts/intensive")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminIeltsIntensiveController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AdminAuditLogService,
    private readonly storageService: StorageService
  ) {}

  @Get()
  async findAll(@Query("type") type?: IeltsIntensiveExamType) {
    const where: any = {};
    if (type) {
      where.type = type;
    }
    return this.prisma.ieltsIntensiveExam.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const exam = await this.prisma.ieltsIntensiveExam.findUnique({
      where: { id },
    });
    if (!exam) {
      throw new NotFoundException(`Intensive exam with ID ${id} not found.`);
    }
    return exam;
  }

  @Post()
  async create(@Body() dto: CreateExamDto, @Request() req: any) {
    const created = await this.prisma.ieltsIntensiveExam.create({
      data: {
        title: dto.title,
        description: dto.description || null,
        imageUrl: (dto as any).imageUrl || null,
        duration: dto.duration,
        type: dto.type,
        difficulty: dto.difficulty,
        isPublished: dto.isPublished || false,
        questions: dto.questions,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "CREATE",
      "INTENSIVE_EXAM",
      created.id,
      { title: created.title, type: created.type }
    );

    return created;
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateExamDto, @Request() req: any) {
    const updated = await this.prisma.ieltsIntensiveExam.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description || undefined,
        duration: dto.duration || undefined,
        isPublished: dto.isPublished !== undefined ? dto.isPublished : undefined,
      },
    });

    await this.auditLogService.log(
      req.user.id,
      "UPDATE",
      "INTENSIVE_EXAM",
      updated.id,
      { title: updated.title, type: updated.type, isPublished: updated.isPublished }
    );

    return updated;
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Request() req: any) {
    // Find the exam to retrieve provenance and importJobId
    const exam = await this.prisma.ieltsIntensiveExam.findUnique({
      where: { id },
    });

    if (!exam) {
      throw new NotFoundException(`Intensive exam with ID ${id} not found.`);
    }

    // Clean up associated media assets (Stage 1 physical orphan media deletion)
    let mediaCleared = 0;
    if (exam.importJobId) {
      const importJob = await this.prisma.contentImportJob.findUnique({
        where: { id: exam.importJobId },
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

    await this.prisma.ieltsIntensiveExam.delete({
      where: { id },
    });

    await this.auditLogService.log(
      req.user.id,
      "DELETE",
      "INTENSIVE_EXAM",
      id,
      { title: exam.title, type: exam.type, importJobId: exam.importJobId, mediaCleared }
    );

    return { success: true, message: `Exam deleted successfully. Cleared ${mediaCleared} media assets.` };
  }

  @Patch(":id/publish")
  async publish(@Param("id") id: string, @Request() req: any) {
    const updated = await this.prisma.ieltsIntensiveExam.update({
      where: { id },
      data: { isPublished: true },
    });

    await this.auditLogService.log(
      req.user.id,
      "PUBLISH",
      "INTENSIVE_EXAM",
      updated.id,
      { title: updated.title, type: updated.type }
    );

    return updated;
  }
}
