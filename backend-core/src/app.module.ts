import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

// Import modules
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { AiClientModule } from "./modules/ai-client/ai-client.module";
import { IeltsModule } from "./modules/ielts/ielts.module";
import { ShadowingDictationModule } from "./modules/shadowing-dictation/shadowing-dictation.module";

// Learning content modules
import { PronunciationModule } from "./modules/pronunciation/pronunciation.module";
import { VocabLabModule } from "./modules/vocab-lab/vocab-lab.module";
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
      path: '/metrics',
      defaultMetrics: { enabled: true },
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    // Configuration module - loads environment variables.
    // In containers (NODE_ENV=production) skip .env.local — env vars come from docker-compose.
    // Locally, .env.local takes priority so developers don't touch the shared .env.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "production" ? [".env"] : [".env.local", ".env"],
    }),

    // Common modules
    PrismaModule,
    RedisModule,
    CacheModule,

    // Feature modules
    AuthModule,
    UsersModule,
    AiClientModule,
    IeltsModule,
    ShadowingDictationModule,

    // Learning content modules
    PronunciationModule,
    VocabLabModule,
    NotificationsModule,
    PostsModule,
    GamificationModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
