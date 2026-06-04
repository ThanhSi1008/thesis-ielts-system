import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { AiClientModule } from "../ai-client/ai-client.module";
import { GamificationModule } from "../gamification/gamification.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

// Shadowing Controllers & Services
import { ShadowingLessonsController } from "./controllers/shadowing-lessons.controller";
import { ShadowingVideosController } from "./controllers/shadowing-videos.controller";
import { ShadowingFoldersController } from "./controllers/shadowing-folders.controller";
import { ShadowingProgressController } from "./controllers/shadowing-progress.controller";
import { ShadowingWebhookController } from "./controllers/shadowing-webhook.controller";
import { AdminShadowingController } from "./controllers/admin-shadowing.controller";
import { ShadowingLessonsService } from "./services/shadowing-lessons.service";
import { ShadowingVideosService } from "./services/shadowing-videos.service";
import { ShadowingFoldersService } from "./services/shadowing-folders.service";
import { ShadowingProgressService } from "./services/shadowing-progress.service";
import { AdminShadowingService } from "./services/admin-shadowing.service";

// Dictation Controllers & Services
import { DictationLessonsController } from "./controllers/dictation-lessons.controller";
import { DictationVideosController } from "./controllers/dictation-videos.controller";
import { DictationFoldersController } from "./controllers/dictation-folders.controller";
import { DictationProgressController } from "./controllers/dictation-progress.controller";
import { DictationWebhookController } from "./controllers/dictation-webhook.controller";
import { AdminDictationController } from "./controllers/admin-dictation.controller";
import { DictationLessonsService } from "./services/dictation-lessons.service";
import { DictationVideosService } from "./services/dictation-videos.service";
import { DictationFoldersService } from "./services/dictation-folders.service";
import { DictationProgressService } from "./services/dictation-progress.service";
import { AdminDictationService } from "./services/admin-dictation.service";
import { TranscriptionResultConsumerService } from "./services/transcription-result-consumer.service";

@Module({
  imports: [PrismaModule, NotificationsModule, AiClientModule, GamificationModule, SubscriptionsModule],
  controllers: [
    // Shadowing
    ShadowingLessonsController,
    ShadowingVideosController,
    ShadowingFoldersController,
    ShadowingProgressController,
    ShadowingWebhookController,
    AdminShadowingController,
    // Dictation
    DictationLessonsController,
    DictationVideosController,
    DictationFoldersController,
    DictationProgressController,
    DictationWebhookController,
    AdminDictationController,
  ],
  providers: [
    // Shadowing
    ShadowingLessonsService,
    ShadowingVideosService,
    ShadowingFoldersService,
    ShadowingProgressService,
    AdminShadowingService,
    // Dictation
    DictationLessonsService,
    DictationVideosService,
    DictationFoldersService,
    DictationProgressService,
    AdminDictationService,
    TranscriptionResultConsumerService,
  ],
  exports: [
    ShadowingLessonsService,
    ShadowingVideosService,
    DictationLessonsService,
    DictationVideosService,
  ],
})
export class ShadowingDictationModule {}

