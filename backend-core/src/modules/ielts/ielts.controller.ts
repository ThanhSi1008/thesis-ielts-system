import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { IeltsService } from "./ielts.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("ielts")
export class IeltsController {
  constructor(private readonly ieltsService: IeltsService) {}

  @Get("skills")
  async getSkills() {
    return this.ieltsService.findAllSkills();
  }

  @Get("skills/:skillName/lessons")
  async getLessonsBySkill(@Param("skillName") skillName: string) {
    return this.ieltsService.findLessonsBySkill(skillName);
  }

  @Get("lessons/:id")
  async getLesson(@Param("id") id: string) {
    return this.ieltsService.findLessonById(id);
  }

  @Get("lessons/:id/exercises")
  async getExercisesByLesson(@Param("id") id: string) {
    return this.ieltsService.findExercisesByLesson(id);
  }

  @Get("exercises/:id")
  async getExercise(@Param("id") id: string) {
    return this.ieltsService.findExerciseById(id);
  }
}
