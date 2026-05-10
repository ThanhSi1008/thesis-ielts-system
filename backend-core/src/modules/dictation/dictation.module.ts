import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { AiClientModule } from "../ai-client/ai-client.module";
import { GamificationModule } from "../gamification/gamification.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

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

@Module({
  imports: [PrismaModule, NotificationsModule, AiClientModule, GamificationModule, SubscriptionsModule],
  controllers: [
    DictationLessonsController,
    DictationVideosController,
    DictationFoldersController,
    DictationProgressController,
    DictationWebhookController,
    AdminDictationController,
  ],
  providers: [
    DictationLessonsService,
    DictationVideosService,
    DictationFoldersService,
    DictationProgressService,
    AdminDictationService,
  ],
})
export class DictationModule {}
