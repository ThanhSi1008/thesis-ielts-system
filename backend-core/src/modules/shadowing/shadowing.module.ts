import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { AiClientModule } from "../ai-client/ai-client.module";

import { ShadowingLessonsController } from "./controllers/shadowing-lessons.controller";
import { ShadowingVideosController } from "./controllers/shadowing-videos.controller";
import { ShadowingFoldersController } from "./controllers/shadowing-folders.controller";
import { ShadowingProgressController } from "./controllers/shadowing-progress.controller";
import { ShadowingWebhookController } from "./controllers/shadowing-webhook.controller";

import { ShadowingLessonsService } from "./services/shadowing-lessons.service";
import { ShadowingVideosService } from "./services/shadowing-videos.service";
import { ShadowingFoldersService } from "./services/shadowing-folders.service";
import { ShadowingProgressService } from "./services/shadowing-progress.service";

@Module({
  imports: [PrismaModule, AiClientModule],
  controllers: [
    ShadowingLessonsController,
    ShadowingVideosController,
    ShadowingFoldersController,
    ShadowingProgressController,
    ShadowingWebhookController,
  ],
  providers: [
    ShadowingLessonsService,
    ShadowingVideosService,
    ShadowingFoldersService,
    ShadowingProgressService,
  ],
})
export class ShadowingModule {}

