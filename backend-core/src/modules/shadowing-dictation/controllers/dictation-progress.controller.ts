import { Controller, Get, Post, Param, Body, Req, UseGuards } from "@nestjs/common";
import { DictationProgressService } from "../services/dictation-progress.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { UpsertDictationProgressDto } from "../dto/upsert-dictation-progress.dto";

@Controller("dictation/progress")
@UseGuards(JwtAuthGuard)
export class DictationProgressController {
  constructor(private readonly service: DictationProgressService) {}

  @Get()
  findAll(@Req() req: any) { return this.service.findAllByUser(req.user.id); }

  @Get(":lessonId")
  findByLesson(@Req() req: any, @Param("lessonId") lessonId: string) {
    return this.service.findByLesson(req.user.id, lessonId);
  }

  @Post()
  upsert(@Req() req: any, @Body() dto: UpsertDictationProgressDto) {
    return this.service.upsert(req.user.id, dto);
  }
}

