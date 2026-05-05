import { Module } from "@nestjs/common";
import { VocabularyController } from "./vocabulary.controller";
import { VocabularyService } from "./vocabulary.service";

import { PrismaModule } from "../../common/prisma/prisma.module";
import { RedisModule } from "../../common/redis/redis.module";
import { GamificationModule } from "../gamification/gamification.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [PrismaModule, RedisModule, GamificationModule, SubscriptionsModule],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService],
})
export class VocabularyModule {}
