import { Module } from "@nestjs/common";
import { ExamsController } from "./exams.controller";
import { ExamsService } from "./exams.service";
import { AiClientModule } from "../ai-client/ai-client.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";

@Module({
  imports: [AiClientModule, SubscriptionsModule],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
