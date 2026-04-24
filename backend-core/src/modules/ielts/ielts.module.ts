import { Module } from "@nestjs/common";
import { IeltsService } from "./ielts.service";
import { IeltsRoadmapService } from "./ielts-roadmap.service";
import { IeltsController } from "./ielts.controller";
import { IeltsAdvancedController } from "./ielts-advanced.controller";
import { IeltsAdvancedService } from "./ielts-advanced.service";
import { StreakService } from "./streak.service";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [IeltsController, IeltsAdvancedController],
  providers: [IeltsService, IeltsRoadmapService, IeltsAdvancedService, StreakService],
  exports: [IeltsService, IeltsRoadmapService, IeltsAdvancedService, StreakService],
})
export class IeltsModule {}
