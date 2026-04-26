import { Module } from "@nestjs/common";
import { ShadowingController } from "./shadowing.controller";
import { ShadowingService } from "./shadowing.service";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ShadowingController],
  providers: [ShadowingService],
})
export class ShadowingModule {}
