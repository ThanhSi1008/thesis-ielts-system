import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { AdminShadowingService } from "../services/admin-shadowing.service";
import { AdminCreateLessonDto } from "../dto/admin-create-shadowing-lesson.dto";
import { AdminUpdateLessonDto } from "../dto/admin-update-shadowing-lesson.dto";
import { AdminImportYoutubeDto } from "../dto/admin-import-shadowing-youtube.dto";

@Controller("admin/shadowing/lessons")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminShadowingController {
  constructor(private readonly service: AdminShadowingService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: AdminCreateLessonDto) {
    return this.service.create(dto);
  }

  @Post("import")
  importYoutube(@Body() dto: AdminImportYoutubeDto) {
    return this.service.importYoutube(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: AdminUpdateLessonDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}

