import { Controller, Patch, Param, Body } from "@nestjs/common";
import { ShadowingVideosService } from "../services/shadowing-videos.service";

@Controller("shadowing/webhooks")
export class ShadowingWebhookController {
  constructor(private readonly service: ShadowingVideosService) {}

  @Patch("videos/:id/complete")
  completeTranscription(@Param("id") id: string, @Body() dto: any) {
    return this.service.completeTranscription(id, dto);
  }
}

