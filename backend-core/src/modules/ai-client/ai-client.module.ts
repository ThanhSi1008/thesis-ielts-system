import { Module } from "@nestjs/common";
import { AiClientService } from "./ai-client.service";
import { ChatController } from "./chat.controller";

@Module({
  controllers: [ChatController],
  providers: [AiClientService],
  exports: [AiClientService],
})
export class AiClientModule {}
