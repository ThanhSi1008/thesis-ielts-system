import { Module } from "@nestjs/common";
import { IeltsService } from "./ielts.service";
import { IeltsRoadmapService } from "./ielts-roadmap.service";
import { IeltsController } from "./ielts.controller";
import { IeltsAdvancedController } from "./ielts-advanced.controller";
import { IeltsAdvancedService } from "./ielts-advanced.service";
import { StreakService } from "./streak.service";
import { IeltsStatisticsController } from "./ielts-statistics.controller";
import { IeltsStatisticsService } from "./ielts-statistics.service";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { AiClientModule } from "../ai-client/ai-client.module";
import { GamificationModule } from "../gamification/gamification.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [PrismaModule, NotificationsModule, AiClientModule, GamificationModule, SubscriptionsModule],
  controllers: [IeltsController, IeltsAdvancedController, IeltsStatisticsController],
  providers: [
    IeltsService,
    IeltsRoadmapService,
    IeltsAdvancedService,
    StreakService,
    IeltsStatisticsService,
  ],
  exports: [
    IeltsService,
    IeltsRoadmapService,
    IeltsAdvancedService,
    StreakService,
  ],
})
export class IeltsModule {}
