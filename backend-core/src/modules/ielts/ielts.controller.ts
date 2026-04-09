import { Controller, Get, Param } from "@nestjs/common";
import { IeltsService } from "./ielts.service";

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

  // ── Listening exercises ─────────────────────────────────────────────────

  @Get("lessons/:id/listening-exercises")
  async getListeningExercisesByLesson(@Param("id") id: string) {
    return this.ieltsService.findListeningExercisesByLesson(id);
  }

  @Get("listening-exercises/:id")
  async getListeningExercise(@Param("id") id: string) {
    return this.ieltsService.findListeningExerciseById(id);
  }

  // ── Reading exercises ───────────────────────────────────────────────────

  @Get("lessons/:id/reading-exercises")
  async getReadingExercisesByLesson(@Param("id") id: string) {
    return this.ieltsService.findReadingExercisesByLesson(id);
  }

  @Get("reading-exercises/:id")
  async getReadingExercise(@Param("id") id: string) {
    return this.ieltsService.findReadingExerciseById(id);
  }
}
