import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// Import modules
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ExamsModule } from "./modules/exams/exams.module";
import { ResultsModule } from "./modules/results/results.module";
import { LearningModule } from "./modules/learning/learning.module";
import { AiClientModule } from "./modules/ai-client/ai-client.module";
import { IeltsModule } from "./modules/ielts/ielts.module";

// Learning content modules
import { VocabularyModule } from "./modules/vocabulary/foundationVocabWord.module";
import { GrammarModule } from "./modules/grammar/grammar.module";
import { PronunciationModule } from "./modules/pronunciation/pronunciation.module";
import { VocabLabModule } from "./modules/vocab-lab/vocab-lab.module";
import { NotesModule } from "./modules/notes/notes.module";
import { ShadowingModule } from "./modules/shadowing/shadowing.module";
import { DictationModule } from "./modules/dictation/dictation.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PostsModule } from "./modules/posts/posts.module";
import { GamificationModule } from "./modules/gamification/gamification.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";

// Import common modules
import { PrismaModule } from "./common/prisma/prisma.module";
import { RedisModule } from "./common/redis/redis.module";
import { CacheModule } from "./common/cache/cache.module";

// Trigger CI/CD: Added Prometheus metrics endpoint
@Module({
  imports: [
    PrometheusModule.register({
      path: '/api/v1/metrics',
      defaultMetrics: { enabled: true },
    }),
    ScheduleModule.forRoot(),
    // Configuration module - loads environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
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
    IeltsModule,

    // Learning content modules
    VocabularyModule,
    GrammarModule,
    PronunciationModule,
    VocabLabModule,
    NotesModule,
    ShadowingModule,
    DictationModule,
    NotificationsModule,
    PostsModule,
    GamificationModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
