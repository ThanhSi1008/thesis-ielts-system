import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";

@Injectable()
export class AdminAuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Log an admin action to the database.
   */
  async log(
    userId: string,
    action: string, // "IMPORT", "COMMIT", "DISCARD", "RETRY", "DELETE", "PUBLISH", "UPDATE"
    entityType: string, // "INTENSIVE_EXAM", "ADVANCED_LISTENING_PART", "IMPORT_JOB", etc.
    entityId?: string,
    details?: any
  ): Promise<void> {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId: entityId || null,
          details: details || {},
        },
      });
    } catch (error) {
      console.error(`[AdminAuditLogService] Failed to write audit log: ${error.message}`);
    }
  }
}
