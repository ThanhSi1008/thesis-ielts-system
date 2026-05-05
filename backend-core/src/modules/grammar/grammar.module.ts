import { Module } from "@nestjs/common";
import { GrammarController } from "./grammar.controller";
import { GrammarService } from "./grammar.service";
import { GamificationModule } from "../gamification/gamification.module";

import { NotificationsModule } from "../notifications/notifications.module";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule, NotificationsModule, GamificationModule],
  controllers: [GrammarController],
  providers: [GrammarService],
  exports: [GrammarService],
})
export class GrammarModule {}
