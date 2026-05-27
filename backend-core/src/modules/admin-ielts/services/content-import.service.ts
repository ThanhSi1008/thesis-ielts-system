import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ServiceUnavailableException,
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
  ContentImportSourceType,
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
   * AI-assisted Refinement proxy. Forwards the current structured JSON, the Admin's
   * natural-language instruction, and an optional screenshot to the FastAPI
   * backend-ai `/refine` endpoint (multipart/form-data) and returns the repaired
   * JSON. This is a stateless pass-through — it never mutates the import job record;
   * the Admin reviews the returned JSON in the editor and decides whether to commit.
   */
  async refineWithAi(params: {
    payload: string;
    instruction: string;
    skill?: string;
    image?: Express.Multer.File;
  }): Promise<{ structuredJson: any }> {
    const { payload, instruction, skill, image } = params;

    if (!instruction || !instruction.trim()) {
      throw new BadRequestException("A refinement instruction is required.");
    }
    try {
      JSON.parse(payload);
    } catch {
      throw new BadRequestException("payload must be a valid JSON string.");
    }
    if (image && !(image.mimetype || "").startsWith("image/")) {
      throw new BadRequestException("The attached file must be an image.");
    }

    const host = this.configService.get<string>("BACKEND_AI_HOST") || "backend-ai";
    const port = this.configService.get<string>("BACKEND_AI_PORT") || "8000";
    const url = `http://${host}:${port}/api/v1/refine`;

    // multipart/form-data via the global fetch/FormData/Blob (Node 18+, undici) —
    // the same native-fetch approach already used elsewhere in this service tier.
    const form = new FormData();
    form.append("payload", payload);
    form.append("instruction", instruction);
    if (skill) form.append("skill", skill);
    if (image) {
      // Wrap in a fresh Uint8Array so the Blob part is backed by a plain ArrayBuffer
      // (Node's Buffer is typed as ArrayBufferLike, which BlobPart rejects).
      const blob = new Blob([new Uint8Array(image.buffer)], {
        type: image.mimetype || "image/png",
      });
      form.append("image", blob, image.originalname || "screenshot.png");
    }

    const response = await fetch(url, { method: "POST", body: form }).catch((e: any) => {
      throw new ServiceUnavailableException(
        `Could not reach the AI refinement service: ${e?.message || e}`
      );
    });

    const text = await response.text();
    if (!response.ok) {
      // Surface the FastAPI `detail` (422 schema rejection, 502 Gemini error, …).
      let detail: any = text;
      try {
        detail = JSON.parse(text)?.detail ?? text;
      } catch {
        /* keep raw text */
      }
      if (response.status === 400 || response.status === 422) {
        throw new BadRequestException(detail || "AI could not apply the requested refinement.");
      }
      throw new ServiceUnavailableException(detail || "AI refinement service error.");
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new ServiceUnavailableException("AI refinement returned malformed JSON.");
    }
  }

  /**
   * Creates one or multiple import jobs based on target skill and triggers AMQP pipelines.
   */
  async create(dto: CreateImportJobDto, userId: string): Promise<any> {
    // ─── COST GUARD: Prevention of budget runaway ───
    const costGuardLimit = this.configService.get<number>("IMPORT_JOB_GEMINI_LIMIT_24H", 10000000);
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

    const isRawTextPaste = dto.sourceType === ContentImportSourceType.RAW_TEXT_PASTE;

    if (dto.skill === ContentImportSkill.FULL_TEST) {
      if (isRawTextPaste) {
        throw new BadRequestException(
          "RAW_TEXT_PASTE is not supported for FULL_TEST imports. Please upload a PDF file."
        );
      }

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
            audioscriptRef: s === ContentImportSkill.LISTENING ? (dto.audioscriptRef ?? null) : null,
            provenance: dto.provenance,
            status: ContentImportStatus.PENDING,
            processingStartedAt: new Date(),
            audioUrls: s === ContentImportSkill.LISTENING ? (dto.audioUrls ?? []) : [],
          },
        });
        createdJobs.push(created);

        await this.aiClientService.publishExtractionTask({
          jobId: created.id,
          targetSystem: created.targetSystem,
          skill: created.skill,
          sourceType: created.sourceType,
          sourceRef: created.sourceRef,
          audioscriptRef: created.audioscriptRef ?? undefined,
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
      const created = await this.prisma.contentImportJob.create({
        data: {
          createdById: userId,
          targetSystem: dto.targetSystem,
          skill: dto.skill,
          sourceType: dto.sourceType,
          sourceRef: dto.sourceRef,
          audioscriptRef: dto.audioscriptRef ?? null,
          provenance: dto.provenance,
          mediaAssets: dto.mediaAssets || null,
          audioUrls: dto.audioUrls ?? [],
          rawText: isRawTextPaste ? dto.sourceRef : null,
          status: ContentImportStatus.PENDING,
          processingStartedAt: new Date(),
        },
      });

      await this.aiClientService.publishExtractionTask({
        jobId: created.id,
        targetSystem: created.targetSystem,
        skill: created.skill,
        sourceType: created.sourceType,
        sourceRef: created.sourceRef,
        audioscriptRef: created.audioscriptRef ?? undefined,
        provenance: created.provenance,
        rawText: isRawTextPaste ? dto.sourceRef : undefined,
        mediaAssets: dto.mediaAssets?.length ? dto.mediaAssets : undefined,
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
      
      let friendlyError = callbackDto.error;
      const lowerErr = callbackDto.error.toLowerCase();
      if (lowerErr.includes("skill mismatch")) {
        // Strip the "Extraction failed: " prefix added by the Python consumer so the
        // descriptive mismatch message reaches the admin UI directly.
        friendlyError = callbackDto.error.replace(/^extraction failed:\s*/i, "");
      } else if (lowerErr.includes("503") || lowerErr.includes("service unavailable") || lowerErr.includes("overloaded")) {
        friendlyError = "Google's AI server is temporarily overloaded. Please wait a moment and click 'Extract' again!";
      } else if (lowerErr.includes("429") || lowerErr.includes("resource_exhausted") || lowerErr.includes("quota") || lowerErr.includes("rate limit") || lowerErr.includes("quota drained")) {
        friendlyError = "The daily free-tier quota for Gemini Flash has been exhausted. The system will automatically reset and resume normal operation tomorrow.";
      }
      
      data.error = friendlyError;
    } else {
      data.status = ContentImportStatus.AWAITING_REVIEW;
      data.geminiModel = callbackDto.geminiModel || null;
      data.tokensUsed = callbackDto.tokensUsed || null;
      data.error = null;

      // Merge mediaAssets: start from the user-uploaded assets stored at job-creation
      // time (e.g. chart_image for WRITING), then add any NEW assets the Python worker
      // extracted (e.g. audio/image assets from the PDF). Never overwrite by storedUrl.
      const existingAssets: any[] = Array.isArray(job.mediaAssets) ? (job.mediaAssets as any[]) : [];
      const callbackAssets: any[] = Array.isArray(callbackDto.mediaAssets) ? callbackDto.mediaAssets : [];
      const existingUrls = new Set(existingAssets.map((a: any) => a.storedUrl).filter(Boolean));
      const newAssets = callbackAssets.filter((a: any) => !existingUrls.has(a.storedUrl));
      data.mediaAssets = [...existingAssets, ...newAssets];

      // Post-process structuredJson server-side — NestJS has both provenance and
      // mediaAssets, making it a more reliable injection point than the Python worker.
      let structuredJson = callbackDto.structuredJson || null;
      if (structuredJson) {
        const prov = job.provenance as any;

        // 1. Override title with a canonical format derived from provenance so the
        //    admin never sees a Gemini-hallucinated or differently-formatted title.
        //    Format: "Cambridge IELTS <N> - <Skill> Test <T>"
        if (prov?.bookNumber && prov?.testNumber) {
          const skillLabel = ({
            WRITING: "Writing", LISTENING: "Listening",
            READING: "Reading", SPEAKING: "Speaking",
          } as Record<string, string>)[job.skill] ?? job.skill;
          structuredJson = {
            ...structuredJson,
            title: `Cambridge IELTS ${prov.bookNumber} - ${skillLabel} Test ${prov.testNumber}`,
          };
        }

        // 2. Inject chart imageUrl into TASK_1 using the merged mediaAssets so the
        //    image uploaded at job-creation is always present in the review editor.
        if (job.skill === ContentImportSkill.WRITING) {
          const chartAsset = (data.mediaAssets as any[]).find((a: any) => a.kind === "chart_image");
          if (chartAsset?.storedUrl && Array.isArray(structuredJson.tasks)) {
            structuredJson = {
              ...structuredJson,
              tasks: (structuredJson.tasks as any[]).map((t: any) =>
                t.taskType === "TASK_1" && !t.imageUrl
                  ? { ...t, imageUrl: chartAsset.storedUrl }
                  : t
              ),
            };
          }
        }
      }
      data.structuredJson = structuredJson;
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
        mediaAssets: saveDraftDto.mediaAssets !== undefined ? saveDraftDto.mediaAssets : job.mediaAssets,
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
      audioscriptRef: job.audioscriptRef || undefined,
      provenance: updated.provenance,
      rawText: job.rawText || undefined,
      mediaAssets: (job.mediaAssets as any[])?.length ? (job.mediaAssets as any[]) : undefined,
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
