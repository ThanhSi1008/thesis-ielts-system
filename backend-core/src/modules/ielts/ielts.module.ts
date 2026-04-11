import { Module } from "@nestjs/common";
import { IeltsService } from "./ielts.service";
import { IeltsRoadmapService } from "./ielts-roadmap.service";
import { IeltsController } from "./ielts.controller";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [IeltsController],
  providers: [IeltsService, IeltsRoadmapService],
  exports: [IeltsService, IeltsRoadmapService],
})
export class IeltsModule {}
