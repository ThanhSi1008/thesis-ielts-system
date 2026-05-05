import { Module } from "@nestjs/common";
import { VocabLabController } from "./vocab-lab.controller";
import { VocabLabService } from "./vocab-lab.service";
import { StorageModule } from "../../common/storage/storage.module";
import { GamificationModule } from "../gamification/gamification.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { RedisModule } from "../../common/redis/redis.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [PrismaModule, RedisModule, NotificationsModule, StorageModule, GamificationModule, SubscriptionsModule],
  controllers: [VocabLabController],
  providers: [VocabLabService],
  exports: [VocabLabService],
})
export class VocabLabModule {}
