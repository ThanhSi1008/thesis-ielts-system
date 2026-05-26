import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { ContentImportStatus } from "@prisma/client";
import { ConfigService } from "@nestjs/config";
import { AdminAuditLogService } from "./admin-audit-log.service";

@Injectable()
export class ImportCronService {
  private readonly logger = new Logger(ImportCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AdminAuditLogService
  ) {}

  /**
   * Run every 5 minutes to find stuck jobs and clean up expired groups.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleStuckJobs() {
    this.logger.log("⏱️ Running stuck import jobs recovery and group TTL cleanup routine...");

    const timeoutSeconds = this.configService.get<number>("IMPORT_JOB_TIMEOUT_SECONDS", 600); // Default 10 minutes
    const now = new Date();
    const thresholdTime = new Date(now.getTime() - timeoutSeconds * 1000);

    try {
      // 1. Recover Stuck Jobs
      // Find jobs stuck in SCRAPING or EXTRACTING that started processing before the threshold time.
      const stuckJobs = await this.prisma.contentImportJob.findMany({
        where: {
          status: {
            in: [ContentImportStatus.SCRAPING, ContentImportStatus.EXTRACTING],
          },
          OR: [
            { processingStartedAt: { lt: thresholdTime } },
            {
              processingStartedAt: null,
              updatedAt: { lt: thresholdTime },
            },
          ],
        },
      });

      if (stuckJobs.length > 0) {
        this.logger.warn(`Found ${stuckJobs.length} stuck content import jobs. Recovering them to FAILED...`);

        for (const job of stuckJobs) {
          await this.prisma.contentImportJob.update({
            where: { id: job.id },
            data: {
              status: ContentImportStatus.FAILED,
              error: `Processing timeout — worker may have crashed (processing exceeded ${timeoutSeconds}s)`,
            },
          });

          // Log to admin audit log
          await this.auditLogService.log(
            job.createdById,
            "RECOVER_TIMEOUT",
            "IMPORT_JOB",
            job.id,
            {
              skill: job.skill,
              targetSystem: job.targetSystem,
              startedAt: job.processingStartedAt,
              updatedAt: job.updatedAt,
            }
          );

          this.logger.log(`recovered stuck job ${job.id}`);
        }
      }

      // 2. Group TTL cleanup
      // Auto-discard failed or pending jobs in a group when groupExpiresAt < NOW()
      const expiredGroupJobs = await this.prisma.contentImportJob.findMany({
        where: {
          groupId: { not: null },
          groupExpiresAt: { lt: now },
          status: {
            in: [
              ContentImportStatus.PENDING,
              ContentImportStatus.SCRAPING,
              ContentImportStatus.EXTRACTING,
              ContentImportStatus.FAILED,
            ],
          },
        },
      });

      if (expiredGroupJobs.length > 0) {
        this.logger.warn(`Found ${expiredGroupJobs.length} zombie/incomplete group jobs past their TTL. Auto-discarding...`);

        for (const job of expiredGroupJobs) {
          await this.prisma.contentImportJob.update({
            where: { id: job.id },
            data: {
              status: ContentImportStatus.DISCARDED,
              error: "Group TTL expired — auto-discarded incomplete skill job.",
            },
          });

          await this.auditLogService.log(
            job.createdById,
            "AUTO_DISCARD_TTL",
            "IMPORT_JOB",
            job.id,
            {
              groupId: job.groupId,
              groupExpiresAt: job.groupExpiresAt,
              skill: job.skill,
            }
          );

          this.logger.log(`auto-discarded expired group job ${job.id}`);
        }
      }
    } catch (err) {
      this.logger.error(`Error executing stuck jobs recovery: ${err.message}`, err.stack);
    }
  }
}
