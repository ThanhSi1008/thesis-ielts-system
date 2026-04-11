import { Controller, Get, Param, Post, Body, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IeltsService } from "./ielts.service";
import { IeltsRoadmapService } from "./ielts-roadmap.service";

@Controller("ielts")
export class IeltsController {
  constructor(
    private readonly ieltsService: IeltsService,
    private readonly ieltsRoadmapService: IeltsRoadmapService
  ) {}

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

  // ── Progress Tracking ───────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get("progress")
  async getProgress(@Request() req: any) {
    return this.ieltsService.getUserProgress(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("progress/mark-completed")
  async markCompleted(
    @Request() req: any,
    @Body()
    body: {
      lessonId?: string;
      listeningExerciseId?: string;
      readingExerciseId?: string;
    }
  ) {
    return this.ieltsService.markItemCompleted(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post("progress/reset")
  async resetProgress(@Request() req: any) {
    return this.ieltsService.resetProgress(req.user.id);
  }

  // ── Roadmap ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get("roadmap")
  async getRoadmap(@Request() req: any) {
    return this.ieltsRoadmapService.generateRoadmap(req.user.id);
  }
}
