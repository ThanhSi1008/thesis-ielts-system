import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { PronunciationController } from "./pronunciation.controller";
import { PronunciationService } from "./pronunciation.service";
import { PronunciationResultConsumerService } from "./pronunciation-result-consumer.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { GamificationModule } from "../gamification/gamification.module";
import { StorageModule } from "../../common/storage/storage.module";
import { AiClientModule } from "../ai-client/ai-client.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    GamificationModule,
    StorageModule,
    AiClientModule,
    SubscriptionsModule,
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
  ],
  controllers: [PronunciationController],
  providers: [PronunciationService, PronunciationResultConsumerService],
  exports: [PronunciationService],
})
export class PronunciationModule {}
