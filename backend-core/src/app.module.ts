import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExamsModule } from './modules/exams/exams.module';
import { ResultsModule } from './modules/results/results.module';
import { LearningModule } from './modules/learning/learning.module';
import { AiClientModule } from './modules/ai-client/ai-client.module';

// Learning content modules
import { VocabularyModule } from './modules/vocabulary/vocabulary.module';
import { GrammarModule } from './modules/grammar/grammar.module';
import { PronunciationModule } from './modules/pronunciation/pronunciation.module';
import { VocabLabModule } from './modules/vocab-lab/vocab-lab.module';

// Import common modules
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { CacheModule } from './common/cache/cache.module';

@Module({
  imports: [
    // Configuration module - loads environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Common modules
    PrismaModule,
    RedisModule,
    CacheModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ExamsModule,
    ResultsModule,
    LearningModule,
    AiClientModule,

    // Learning content modules
    VocabularyModule,
    GrammarModule,
    PronunciationModule,
    VocabLabModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

