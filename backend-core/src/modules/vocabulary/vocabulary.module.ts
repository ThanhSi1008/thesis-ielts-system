import { Module } from "@nestjs/common";
import { VocabularyController } from "./vocabulary.controller";
import { VocabularyService } from "./vocabulary.service";

import { PrismaModule } from "../../common/prisma/prisma.module";
import { RedisModule } from "../../common/redis/redis.module";
import { GamificationModule } from "../gamification/gamification.module";

@Module({
  imports: [PrismaModule, RedisModule, GamificationModule],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService],
})
export class VocabularyModule {}
