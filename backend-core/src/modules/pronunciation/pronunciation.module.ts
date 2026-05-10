import { Module } from "@nestjs/common";
import { PronunciationController } from "./pronunciation.controller";
import { PronunciationService } from "./pronunciation.service";
import { NotificationsModule } from "../notifications/notifications.module";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { GamificationModule } from "../gamification/gamification.module";

@Module({
  imports: [PrismaModule, NotificationsModule, GamificationModule],
  controllers: [PronunciationController],
  providers: [PronunciationService],
  exports: [PronunciationService],
})
export class PronunciationModule {}
