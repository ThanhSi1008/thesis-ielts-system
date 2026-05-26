import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { AiClientService } from "../../ai-client/ai-client.service";
import { AdminAuditLogService } from "./admin-audit-log.service";
import { ConfigService } from "@nestjs/config";
import {
  CreateImportJobDto,
  SaveDraftDto,
  CallbackExtractedDto,
} from "../dto/admin-ielts.dto";
import {
  ContentImportJob,
  ContentImportStatus,
  ContentImportSkill,
} from "@prisma/client";
import { randomUUID } from "crypto";

@Injectable()
export class ContentImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiClientService: AiClientService,
    private readonly auditLogService: AdminAuditLogService,
    private readonly configService: ConfigService
  ) {}

  /**
   * Creates one or multiple import jobs based on target skill and triggers AMQP pipelines.
   */
  async create(dto: CreateImportJobDto, userId: string): Promise<any> {
    // ─── COST GUARD: Prevention of budget runaway ───
    const costGuardLimit = this.configService.get<number>("IMPORT_JOB_GEMINI_LIMIT_24H", 10000000); // 10M tokens limit
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tokensAggregation = await this.prisma.contentImportJob.aggregate({
      _sum: {
        tokensUsed: true,
      },
      where: {
        createdAt: { gte: oneDayAgo },
      },
    });
    const totalTokensUsed24H = tokensAggregation._sum.tokensUsed || 0;
    if (totalTokensUsed24H >= costGuardLimit) {
      throw new BadRequestException(
        `Import blocked by budget safety guard. Gemini 24-hour token usage (${totalTokensUsed24H}) has reached the safety threshold (${costGuardLimit} tokens) to prevent budget runaway.`
      );
    }

    if (dto.skill === ContentImportSkill.FULL_TEST) {
      const groupId = randomUUID();
      const groupExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days TTL
      const skills = [
        ContentImportSkill.LISTENING,
        ContentImportSkill.READING,
        ContentImportSkill.WRITING,
        ContentImportSkill.SPEAKING,
      ];
      
      const createdJobs: ContentImportJob[] = [];
      for (const s of skills) {
        const created = await this.prisma.contentImportJob.create({
          data: {
            createdById: userId,
            targetSystem: dto.targetSystem,
            skill: s,
            groupId,
            groupExpiresAt,
            sourceType: dto.sourceType,
            sourceRef: dto.sourceRef,
            provenance: dto.provenance,
            status: ContentImportStatus.PENDING,
            processingStartedAt: new Date(),
          },
        });
        createdJobs.push(created);

        // Publish to AMQP extraction queue
        await this.aiClientService.publishExtractionTask({
          jobId: created.id,
          targetSystem: created.targetSystem,
          skill: created.skill,
          sourceType: created.sourceType,
          sourceRef: created.sourceRef,
          provenance: created.provenance,
        });
      }

      await this.auditLogService.log(
        userId,
        "IMPORT",
        "IMPORT_JOB_GROUP",
        groupId,
        { skill: dto.skill, targetSystem: dto.targetSystem, jobCount: createdJobs.length }
      );

      return { groupId, jobs: createdJobs };
    } else {
      // Single skill import job
      const created = await this.prisma.contentImportJob.create({
        data: {
          createdById: userId,
          targetSystem: dto.targetSystem,
          skill: dto.skill,
          sourceType: dto.sourceType,
          sourceRef: dto.sourceRef,
          provenance: dto.provenance,
          status: ContentImportStatus.PENDING,
          processingStartedAt: new Date(),
        },
      });

      // Publish to AMQP extraction queue
      await this.aiClientService.publishExtractionTask({
        jobId: created.id,
        targetSystem: created.targetSystem,
        skill: created.skill,
        sourceType: created.sourceType,
        sourceRef: created.sourceRef,
        provenance: created.provenance,
      });

      await this.auditLogService.log(
        userId,
        "IMPORT",
        "IMPORT_JOB",
        created.id,
        { skill: created.skill, targetSystem: created.targetSystem, sourceRef: created.sourceRef }
      );

      return created;
    }
  }

  /**
   * Find a specific import job.
   */
  async findOne(id: string): Promise<ContentImportJob> {
    const job = await this.prisma.contentImportJob.findUnique({
      where: { id },
    });
    if (!job) {
      throw new NotFoundException(`Staging import job ${id} not found.`);
    }
    return job;
  }

  /**
   * List all import jobs with optional skill/status filtering.
   */
  async findAll(): Promise<ContentImportJob[]> {
    return this.prisma.contentImportJob.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Callback from python AI consumer loaded with extraction outputs.
   */
  async saveExtractedContent(id: string, callbackDto: CallbackExtractedDto): Promise<ContentImportJob> {
    const job = await this.prisma.contentImportJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found.`);
    }

    const data: any = {};
    if (callbackDto.error) {
      data.status = ContentImportStatus.FAILED;
      data.error = callbackDto.error;
    } else {
      data.status = ContentImportStatus.AWAITING_REVIEW;
      data.structuredJson = callbackDto.structuredJson || null;
      data.mediaAssets = callbackDto.mediaAssets || null;
      data.geminiModel = callbackDto.geminiModel || null;
      data.tokensUsed = callbackDto.tokensUsed || null;
      data.error = null;
    }

    return this.prisma.contentImportJob.update({
      where: { id },
      data,
    });
  }

  /**
   * Save manual edits to draft before committing. Implements optimistic locking.
   */
  async saveDraft(id: string, saveDraftDto: SaveDraftDto, userId: string): Promise<ContentImportJob> {
    const job = await this.prisma.contentImportJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Staging job ${id} not found.`);
    }

    if (job.version !== saveDraftDto.version) {
      throw new ConflictException(
        "Save failed: The job has been modified by another process. Please reload and try again."
      );
    }

    const updated = await this.prisma.contentImportJob.update({
      where: { id },
      data: {
        structuredJson: saveDraftDto.structuredJson,
        provenance: saveDraftDto.provenance !== undefined ? saveDraftDto.provenance : job.provenance,
        version: job.version + 1,
      },
    });

    await this.auditLogService.log(
      userId,
      "UPDATE_DRAFT",
      "IMPORT_JOB",
      job.id,
      { skill: job.skill, targetSystem: job.targetSystem, version: updated.version }
    );

    return updated;
  }

  /**
   * Discards a single staging job.
   */
  async discard(id: string, userId: string): Promise<ContentImportJob> {
    const job = await this.prisma.contentImportJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Staging job ${id} not found.`);
    }

    const updated = await this.prisma.contentImportJob.update({
      where: { id },
      data: {
        status: ContentImportStatus.DISCARDED,
      },
    });

    await this.auditLogService.log(
      userId,
      "DISCARD",
      "IMPORT_JOB",
      job.id,
      { skill: job.skill, targetSystem: job.targetSystem }
    );

    return updated;
  }

  /**
   * Discards an entire Full Test group.
   */
  async discardGroup(groupId: string, userId: string): Promise<{ success: boolean }> {
    const jobs = await this.prisma.contentImportJob.findMany({
      where: { groupId },
    });

    if (jobs.length === 0) {
      throw new NotFoundException(`No staging jobs found under groupId: ${groupId}`);
    }

    await this.prisma.contentImportJob.updateMany({
      where: { groupId },
      data: {
        status: ContentImportStatus.DISCARDED,
      },
    });

    await this.auditLogService.log(
      userId,
      "DISCARD_GROUP",
      "IMPORT_JOB_GROUP",
      groupId,
      { jobCount: jobs.length }
    );

    return { success: true };
  }

  /**
   * Retries a FAILED job.
   * If rawText exists, we skip scraping (Stage 1) and jump to extraction (Stage 2).
   */
  async retry(id: string, userId: string): Promise<ContentImportJob> {
    const job = await this.prisma.contentImportJob.findUnique({
      where: { id },
    });

    if (!job) {
      throw new NotFoundException(`Staging job ${id} not found.`);
    }

    const nextStatus = job.rawText ? ContentImportStatus.EXTRACTING : ContentImportStatus.PENDING;

    const updated = await this.prisma.contentImportJob.update({
      where: { id: job.id },
      data: {
        status: nextStatus,
        error: null,
        processingStartedAt: new Date(),
      },
    });

    // Re-publish to the extraction queue
    await this.aiClientService.publishExtractionTask({
      jobId: updated.id,
      targetSystem: updated.targetSystem,
      skill: updated.skill,
      sourceType: updated.sourceType,
      sourceRef: updated.sourceRef,
      provenance: updated.provenance,
      rawText: job.rawText || undefined,
      mediaAssets: job.mediaAssets || undefined,
    });

    await this.auditLogService.log(
      userId,
      "RETRY",
      "IMPORT_JOB",
      job.id,
      { skill: job.skill, targetSystem: job.targetSystem, skippedScrape: !!job.rawText }
    );

    return updated;
  }
}
