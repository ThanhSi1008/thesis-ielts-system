import { Module } from "@nestjs/common";
import { IeltsService } from "./ielts.service";
import { IeltsRoadmapService } from "./ielts-roadmap.service";
import { IeltsController } from "./ielts.controller";
import { IeltsAdvancedController } from "./ielts-advanced.controller";
import { IeltsAdvancedService } from "./ielts-advanced.service";
import { IeltsIntensiveController } from "./ielts-intensive.controller";
import { IeltsIntensiveResultsController } from "./ielts-intensive-results.controller";
import { IeltsIntensiveNotesController } from "./ielts-intensive-notes.controller";
import { IeltsIntensiveService } from "./ielts-intensive.service";
import { GradingResultConsumerService } from "./grading-result-consumer.service";
import { StreakService } from "./streak.service";
import { IeltsStatisticsController } from "./ielts-statistics.controller";
import { IeltsStatisticsService } from "./ielts-statistics.service";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { AiClientModule } from "../ai-client/ai-client.module";
import { GamificationModule } from "../gamification/gamification.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

// Submodules
import { GrammarModule } from "./grammar/grammar.module";
import { VocabularyModule } from "./vocabulary/foundationVocabWord.module";
@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    AiClientModule,
    GamificationModule,
    SubscriptionsModule,
    GrammarModule,
    VocabularyModule,
    ],
  controllers: [
    IeltsController,
    IeltsAdvancedController,
    IeltsStatisticsController,
    IeltsIntensiveController,
    IeltsIntensiveResultsController,
    IeltsIntensiveNotesController,
  ],
  providers: [
    IeltsService,
    IeltsRoadmapService,
    IeltsAdvancedService,
    IeltsIntensiveService,
    GradingResultConsumerService,
    StreakService,
    IeltsStatisticsService,
  ],
  exports: [
    IeltsService,
    IeltsRoadmapService,
    IeltsAdvancedService,
    IeltsIntensiveService,
    StreakService,
    GrammarModule,
    VocabularyModule,
    ],
})
export class IeltsModule {}
