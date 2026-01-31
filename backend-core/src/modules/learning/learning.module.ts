import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { LearningController } from "./learning.controller";
import { LearningService } from "./learning.service";
import { StorageModule } from "../../common/storage/storage.module";
import { AiClientModule } from "../ai-client/ai-client.module";

/**
 * Learning Module
 * Provides learning materials, lessons, vocabulary, grammar, and pronunciation features
 */
@Module({
  imports: [
    StorageModule,
    AiClientModule,
    MulterModule.register({
      dest: "./uploads",
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
