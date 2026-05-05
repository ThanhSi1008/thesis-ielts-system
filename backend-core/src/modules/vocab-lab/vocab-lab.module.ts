import { Module } from "@nestjs/common";
import { VocabLabController } from "./vocab-lab.controller";
import { VocabLabService } from "./vocab-lab.service";
import { StorageModule } from "../../common/storage/storage.module";
import { GamificationModule } from "../gamification/gamification.module";

import { NotificationsModule } from "../notifications/notifications.module";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { RedisModule } from "../../common/redis/redis.module";

@Module({
  imports: [PrismaModule, RedisModule, NotificationsModule, StorageModule, GamificationModule],
  controllers: [VocabLabController],
  providers: [VocabLabService],
  exports: [VocabLabService],
})
export class VocabLabModule {}
