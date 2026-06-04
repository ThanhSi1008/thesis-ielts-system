import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { AdminDictationService } from "../services/admin-dictation.service";
import { AdminCreateDictationLessonDto } from "../dto/admin-create-dictation-lesson.dto";
import { AdminUpdateDictationLessonDto } from "../dto/admin-update-dictation-lesson.dto";
import { AdminImportDictationYoutubeDto } from "../dto/admin-import-dictation-youtube.dto";

@Controller("admin/dictation/lessons")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
export class AdminDictationController {
  constructor(private readonly service: AdminDictationService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: AdminCreateDictationLessonDto) {
    return this.service.create(dto);
  }

  @Post("import")
  importYoutube(@Body() dto: AdminImportDictationYoutubeDto) {
    return this.service.importYoutube(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: AdminUpdateDictationLessonDto) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.service.delete(id);
  }
}

