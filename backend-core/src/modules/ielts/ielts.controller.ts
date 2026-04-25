import { Controller, Get, Param, Post, Patch, Body, UseGuards, Request, Query } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IeltsService } from "./ielts.service";
import { IeltsRoadmapService } from "./ielts-roadmap.service";
import { StreakService } from "./streak.service";

@Controller("ielts")
export class IeltsController {
  constructor(
    private readonly ieltsService: IeltsService,
    private readonly ieltsRoadmapService: IeltsRoadmapService,
    private readonly streakService: StreakService
  ) { }

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

  // ── Writing exercises ───────────────────────────────────────────────────

  @Get("lessons/:id/writing-exercises")
  async getWritingExercisesByLesson(@Param("id") id: string) {
    return this.ieltsService.findWritingExercisesByLesson(id);
  }

  @Get("writing-exercises/:id")
  async getWritingExercise(@Param("id") id: string) {
    return this.ieltsService.findWritingExerciseById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Get("writing-exercises/:id/my-answer")
  async getWritingUserAnswer(
    @Request() req: any,
    @Param("id") id: string
  ) {
    return this.ieltsService.getWritingUserAnswer(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("writing-exercises/:id/save-answer")
  async saveWritingUserAnswer(
    @Request() req: any,
    @Param("id") id: string,
    @Body() body: { intro: string; overview: string; body1: string; body2: string }
  ) {
    return this.ieltsService.saveWritingUserAnswer(req.user.id, id, body);
  }

  // ── Exercise Snippet (public — used for lesson examples) ────────────────

  @Get("exercise-snippet")
  async getExerciseSnippet(
    @Query("type") type: string,
    @Query("id") id: string,
    @Query("groupIndex") groupIndex: string
  ) {
    return this.ieltsService.findExerciseSnippet(type, id, parseInt(groupIndex ?? "0", 10));
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
      writingExerciseId?: string;
    }
  ) {
    return this.ieltsService.markItemCompleted(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post("progress/reset")
  async resetProgress(@Request() req: any) {
    return this.ieltsService.resetProgress(req.user.id);
  }

  // ── Library ──────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get("library/stats")
  async getLibraryStats(@Request() req: any) {
    return this.ieltsService.getLibraryStats(req.user.id);
  }

  // ── Roadmap ─────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Request() req: any) {
    // Will return null if they haven't onboarded yet, handled on frontend
    return this.ieltsRoadmapService["prisma"].ieltsProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  async updateProfile(
    @Request() req: any,
    @Body() body: { examDate?: string }
  ) {
    return this.ieltsRoadmapService.updateProfile(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post("onboarding")
  async processOnboarding(
    @Request() req: any,
    @Body() body: {
      targetBand: number;
      dailyCommitmentMins: number;
      examDate?: string;
      takePlacement: boolean;
      placementScore?: number;
      placementListening?: number;
      placementReading?: number;
      placementWriting?: number;
    }
  ) {
    return this.ieltsRoadmapService.processOnboarding(req.user.id, body);
  }

  @Get("placement-exercises")
  async getPlacementExercises() {
    return this.ieltsService.getPlacementExercises();
  }

  @UseGuards(JwtAuthGuard)
  @Get("roadmap")
  async getRoadmap(@Request() req: any) {
    return this.ieltsRoadmapService.generateRoadmap(req.user.id);
  }

  // ── Streak Tracking ──────────────────────────────────────────────────────
  
  @UseGuards(JwtAuthGuard)
  @Get("streak")
  async getStreak(@Request() req: any) {
    return this.streakService.getStreak(req.user.id);
  }
}
