import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ShadowingService } from "./shadowing.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateVideoDto } from "./dto/create-video.dto";
import { UpdateVideoDto } from "./dto/update-video.dto";
import { UpsertProgressDto } from "./dto/upsert-progress.dto";

@Controller("shadowing")
@UseGuards(JwtAuthGuard)
export class ShadowingController {
  constructor(private readonly shadowingService: ShadowingService) {}

  // ── Videos ──────────────────────────────────────────

  @Get("videos")
  getVideos(@Req() req: any) {
    return this.shadowingService.getVideos(req.user.id);
  }

  @Get("videos/:id")
  getVideoById(@Req() req: any, @Param("id") id: string) {
    return this.shadowingService.getVideoById(req.user.id, id);
  }

  @Post("videos")
  createVideo(@Req() req: any, @Body() dto: CreateVideoDto) {
    return this.shadowingService.createVideo(req.user.id, dto);
  }

  @Patch("videos/:id")
  updateVideo(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: UpdateVideoDto,
  ) {
    return this.shadowingService.updateVideo(req.user.id, id, dto);
  }

  @Delete("videos/:id")
  deleteVideo(@Req() req: any, @Param("id") id: string) {
    return this.shadowingService.deleteVideo(req.user.id, id);
  }

  // ── Folders ─────────────────────────────────────────

  @Get("folders")
  getFolders(@Req() req: any) {
    return this.shadowingService.getFolders(req.user.id);
  }

  @Post("folders")
  createFolder(@Req() req: any, @Body() body: { name: string }) {
    return this.shadowingService.createFolder(req.user.id, body.name);
  }

  @Patch("folders/:name")
  renameFolder(
    @Req() req: any,
    @Param("name") name: string,
    @Body() body: { newName: string },
  ) {
    return this.shadowingService.renameFolder(req.user.id, name, body.newName);
  }

  @Delete("folders/:name")
  deleteFolder(@Req() req: any, @Param("name") name: string) {
    return this.shadowingService.deleteFolder(req.user.id, name);
  }

  // ── Progress ─────────────────────────────────────────

  @Get("progress")
  getAllProgress(@Req() req: any) {
    return this.shadowingService.getAllProgress(req.user.id);
  }

  @Get("progress/:lessonId")
  getProgress(@Req() req: any, @Param("lessonId") lessonId: string) {
    return this.shadowingService.getProgress(req.user.id, lessonId);
  }

  @Post("progress")
  upsertProgress(@Req() req: any, @Body() dto: UpsertProgressDto) {
    return this.shadowingService.upsertProgress(req.user.id, dto);
  }
}
