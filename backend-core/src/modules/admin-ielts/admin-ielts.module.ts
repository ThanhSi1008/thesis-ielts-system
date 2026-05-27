import { Module } from "@nestjs/common";
import { AdminIeltsImportController } from "./controllers/admin-ielts-import.controller";
import { AdminIeltsIntensiveController } from "./controllers/admin-ielts-intensive.controller";
import { AdminIeltsAdvancedController } from "./controllers/admin-ielts-advanced.controller";
import { ContentImportService } from "./services/content-import.service";
import { IeltsContentCommitService } from "./services/ielts-content-commit.service";
import { AdminAuditLogService } from "./services/admin-audit-log.service";
import { ImportCronService } from "./services/import-cron.service";
import { AiClientModule } from "../ai-client/ai-client.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [AiClientModule, ConfigModule],
  controllers: [
    AdminIeltsImportController,
    AdminIeltsIntensiveController,
    AdminIeltsAdvancedController,
  ],
  providers: [
    ContentImportService,
    IeltsContentCommitService,
    AdminAuditLogService,
    ImportCronService,
  ],
  exports: [
    ContentImportService,
    IeltsContentCommitService,
    AdminAuditLogService,
    ImportCronService,
  ],
})
export class AdminIeltsModule {}
