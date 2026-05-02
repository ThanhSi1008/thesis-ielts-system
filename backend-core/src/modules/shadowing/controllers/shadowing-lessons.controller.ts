import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ShadowingLessonsService } from "../services/shadowing-lessons.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";

@Controller("shadowing/lessons")
@UseGuards(JwtAuthGuard)
export class ShadowingLessonsController {
  constructor(private readonly service: ShadowingLessonsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.service.findById(id);
  }
}
