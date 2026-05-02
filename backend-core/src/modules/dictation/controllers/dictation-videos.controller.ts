import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from "@nestjs/common";
import { DictationVideosService } from "../services/dictation-videos.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateDictationVideoDto } from "../dto/create-dictation-video.dto";
import { UpdateDictationVideoDto } from "../dto/update-dictation-video.dto";

@Controller("dictation/videos")
@UseGuards(JwtAuthGuard)
export class DictationVideosController {
  constructor(private readonly service: DictationVideosService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Get(":id")
  findById(@Req() req: any, @Param("id") id: string) {
    return this.service.findById(req.user.id, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateDictationVideoDto) {
    return this.service.create(req.user.id, dto);
  }

  @Post("import")
  importYoutube(@Req() req: any, @Body() dto: { youtubeUrl: string; title: string; folder?: string }) {
    return this.service.importYoutube(req.user.id, dto);
  }

  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateDictationVideoDto) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(":id")
  delete(@Req() req: any, @Param("id") id: string) {
    return this.service.delete(req.user.id, id);
  }
}
