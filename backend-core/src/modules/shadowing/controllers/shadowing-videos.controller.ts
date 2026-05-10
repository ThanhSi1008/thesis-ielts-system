import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from "@nestjs/common";
import { ShadowingVideosService } from "../services/shadowing-videos.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { CreateShadowingVideoDto } from "../dto/create-shadowing-video.dto";
import { UpdateShadowingVideoDto } from "../dto/update-shadowing-video.dto";

@Controller("shadowing/videos")
@UseGuards(JwtAuthGuard)
export class ShadowingVideosController {
  constructor(private readonly service: ShadowingVideosService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Get(":id")
  findById(@Req() req: any, @Param("id") id: string) {
    return this.service.findById(req.user.id, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateShadowingVideoDto) {
    return this.service.create(req.user.id, dto);
  }

  @Post("import")
  importYoutube(@Req() req: any, @Body() dto: { youtubeUrl: string; title: string; folder?: string }) {
    return this.service.importYoutube(req.user.id, dto);
  }

  @Patch(":id")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateShadowingVideoDto) {
    return this.service.update(req.user.id, id, dto);
  }

  @Delete(":id")
  delete(@Req() req: any, @Param("id") id: string) {
    return this.service.delete(req.user.id, id);
  }
}
