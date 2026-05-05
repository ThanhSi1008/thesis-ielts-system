import { Module } from "@nestjs/common";
import { PostsController } from "./posts.controller";
import { PostsService } from "./posts.service";
import { StorageModule } from "../../common/storage/storage.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { GamificationModule } from "../gamification/gamification.module";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule, NotificationsModule, StorageModule, GamificationModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
