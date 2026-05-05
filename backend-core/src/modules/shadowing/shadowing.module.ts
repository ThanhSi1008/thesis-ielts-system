import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { AiClientModule } from "../ai-client/ai-client.module";
import { GamificationModule } from "../gamification/gamification.module";

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

@Module({
  imports: [PrismaModule, AiClientModule, GamificationModule],
  controllers: [
    ShadowingLessonsController,
    ShadowingVideosController,
    ShadowingFoldersController,
    ShadowingProgressController,
    ShadowingWebhookController,
    AdminShadowingController,
  ],
  providers: [
    ShadowingLessonsService,
    ShadowingVideosService,
    ShadowingFoldersService,
    ShadowingProgressService,
    AdminShadowingService,
  ],
})
export class ShadowingModule {}

