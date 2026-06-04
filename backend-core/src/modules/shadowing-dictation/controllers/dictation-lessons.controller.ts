import { Controller, Get, Param, UseGuards, Request } from "@nestjs/common";
import { DictationLessonsService } from "../services/dictation-lessons.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

@Controller("dictation/lessons")
@UseGuards(JwtAuthGuard)
export class DictationLessonsController {
  constructor(private readonly service: DictationLessonsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.id);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }
}

