import { Controller, Get, Post, Patch, Delete, Param, Body, Req, UseGuards } from "@nestjs/common";
import { DictationFoldersService } from "../services/dictation-folders.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

@Controller("dictation/folders")
@UseGuards(JwtAuthGuard)
export class DictationFoldersController {
  constructor(private readonly service: DictationFoldersService) {}

  @Get()
  findAll(@Req() req: any) { return this.service.findAll(req.user.id); }

  @Post()
  create(@Req() req: any, @Body() body: { name: string }) {
    return this.service.create(req.user.id, body.name);
  }

  @Patch(":name")
  rename(@Req() req: any, @Param("name") name: string, @Body() body: { newName: string }) {
    return this.service.rename(req.user.id, name, body.newName);
  }

  @Delete(":name")
  delete(@Req() req: any, @Param("name") name: string) {
    return this.service.delete(req.user.id, name);
  }
}

