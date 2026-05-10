import { Controller, Get, Post, Param, Body, Req, UseGuards } from "@nestjs/common";
import { ShadowingProgressService } from "../services/shadowing-progress.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UpsertShadowingProgressDto } from "../dto/upsert-shadowing-progress.dto";

@Controller("shadowing/progress")
@UseGuards(JwtAuthGuard)
export class ShadowingProgressController {
  constructor(private readonly service: ShadowingProgressService) {}

  @Get()
  findAll(@Req() req: any) { return this.service.findAllByUser(req.user.id); }

  @Get(":lessonId")
  findByLesson(@Req() req: any, @Param("lessonId") lessonId: string) {
    return this.service.findByLesson(req.user.id, lessonId);
  }

  @Post()
  upsert(@Req() req: any, @Body() dto: UpsertShadowingProgressDto) {
    return this.service.upsert(req.user.id, dto);
  }
}
