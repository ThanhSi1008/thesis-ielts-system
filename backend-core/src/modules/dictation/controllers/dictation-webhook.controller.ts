import { Controller, Patch, Param, Body } from "@nestjs/common";
import { DictationVideosService } from "../services/dictation-videos.service";

@Controller("dictation/webhooks")
export class DictationWebhookController {
  constructor(private readonly service: DictationVideosService) {}

  @Patch("videos/:id/complete")
  completeTranscription(@Param("id") id: string, @Body() dto: any) {
    return this.service.completeTranscription(id, dto);
  }
}
