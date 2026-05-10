import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from "@nestjs/common";
import { IeltsAdvancedService } from "./ielts-advanced.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { SubscriptionGuard } from "../subscriptions/guards/subscription.guard";
import { RequiresTier } from "../subscriptions/decorators/requires-tier.decorator";

@Controller("ielts/advanced")
@UseGuards(JwtAuthGuard, SubscriptionGuard)
@RequiresTier("PREMIUM")
export class IeltsAdvancedController {
  constructor(private readonly advancedService: IeltsAdvancedService) {}

  @Get("listening")
  async getListeningParts(@Query("questionType") questionType?: string) {
    return this.advancedService.getListeningParts(questionType);
  }

  @Get("listening/:id")
  async getListeningPartDetail(@Param("id") id: string) {
    return this.advancedService.getListeningPartDetail(id);
  }

  @Post("listening/:id/submit")
  async submitListeningPart(
    @Param("id") id: string,
    @Body() payload: { answers: Record<string, string> },
    @Request() req: any,
  ) {
    return this.advancedService.submitListeningPart(req.user.id, id, payload);
  }

  @Get("statistics")
  async getStatistics(@Request() req: any) {
    return this.advancedService.getStatistics(req.user.id);
  }

  @Get("history")
  async getHistory(@Request() req: any, @Query("partId") partId?: string) {
    return this.advancedService.getHistory(req.user.id, partId);
  }

  @Get("history/:id")
  async getHistoryDetail(@Request() req: any, @Param("id") sessionId: string) {
    return this.advancedService.getHistoryDetail(req.user.id, sessionId);
  }

  // --- READING ROUTES ---

  @Get("reading")
  async getReadingParts(@Query("questionType") questionType?: string) {
    return this.advancedService.getReadingParts(questionType);
  }

  @Get("reading/history")
  async getReadingHistory(
    @Request() req: any,
    @Query("partId") partId?: string,
  ) {
    return this.advancedService.getReadingHistory(req.user.id, partId);
  }

  @Get("reading/history/:id")
  async getReadingHistoryDetail(
    @Request() req: any,
    @Param("id") sessionId: string,
  ) {
    return this.advancedService.getReadingHistoryDetail(req.user.id, sessionId);
  }

  @Get("reading/:id")
  async getReadingPartDetail(@Param("id") id: string) {
    return this.advancedService.getReadingPartDetail(id);
  }

  @Post("reading/:id/submit")
  async submitReadingPart(
    @Param("id") id: string,
    @Body() payload: { answers: Record<string, string> },
    @Request() req: any,
  ) {
    return this.advancedService.submitReadingPart(req.user.id, id, payload);
  }

  // --- WRITING ROUTES ---

  @Get("writing/prompts")
  async getWritingPrompts(
    @Request() req: any,
    @Query("taskType") taskType?: string,
    @Query("subType") subType?: string,
    @Query("category") category?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.advancedService.getWritingPrompts(req.user.id, {
      taskType,
      subType,
      category,
      page: parseInt(page || "1"),
      limit: parseInt(limit || "20"),
    });
  }

  @Get("writing/prompts/:id/sessions")
  async getWritingSessionsByPrompt(
    @Request() req: any,
    @Param("id") promptId: string,
  ) {
    return this.advancedService.getWritingSessionsByPrompt(req.user.id, promptId);
  }

  @Get("writing/prompts/:id")
  async getWritingPromptDetail(
    @Request() req: any,
    @Param("id") id: string,
  ) {
    return this.advancedService.getWritingPromptDetail(req.user.id, id);
  }

  @Post("writing/sessions")
  async createWritingSession(
    @Request() req: any,
    @Body() body: { promptId: string },
  ) {
    return this.advancedService.createWritingSession(req.user.id, body.promptId);
  }

  @Patch("writing/sessions/:id/draft")
  async saveWritingDraft(
    @Request() req: any,
    @Param("id") sessionId: string,
    @Body() body: { draftEssay: string },
  ) {
    return this.advancedService.saveWritingDraft(req.user.id, sessionId, body.draftEssay);
  }

  @Post("writing/sessions/:id/submit")
  async submitWritingSession(
    @Request() req: any,
    @Param("id") sessionId: string,
    @Body() body: { essay: string; timeTaken?: number },
  ) {
    return this.advancedService.submitWritingSession(
      req.user.id, sessionId, body.essay, body.timeTaken,
    );
  }

  @Get("writing/sessions/:id")
  async getWritingSession(
    @Request() req: any,
    @Param("id") sessionId: string,
  ) {
    return this.advancedService.getWritingSession(req.user.id, sessionId);
  }

  @Get("writing/history")
  async getWritingHistory(@Request() req: any) {
    return this.advancedService.getWritingHistory(req.user.id);
  }

  // --- SPEAKING ROUTES ---

  @Get("speaking/parts")
  async getSpeakingParts(
    @Request() req: any,
    @Query("partNumber") partNumber?: string,
    @Query("category") category?: string,
    @Query("topic") topic?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.advancedService.getSpeakingParts(req.user.id, {
      partNumber: partNumber ? parseInt(partNumber, 10) : undefined,
      category,
      topic,
      page: parseInt(page || "1", 10),
      limit: parseInt(limit || "20", 10),
    });
  }

  @Get("speaking/parts/:id")
  async getSpeakingPartDetail(@Request() req: any, @Param("id") id: string) {
    return this.advancedService.getSpeakingPartDetail(req.user.id, id);
  }

  @Get("speaking/parts/:id/sessions")
  async getSpeakingSessionsByPart(
    @Request() req: any,
    @Param("id") partId: string,
  ) {
    return this.advancedService.getSpeakingSessionsByPart(req.user.id, partId);
  }

  @Post("speaking/sessions")
  async createSpeakingSession(
    @Request() req: any,
    @Body() body: { partId: string },
  ) {
    return this.advancedService.createSpeakingSession(req.user.id, body.partId);
  }

  @Post("speaking/sessions/:id/submit")
  async submitSpeakingSession(
    @Request() req: any,
    @Param("id") sessionId: string,
    @Body() body: { audioAnswers: Record<string, string>; timeTaken?: number },
  ) {
    return this.advancedService.submitSpeakingSession(
      req.user.id,
      sessionId,
      body.audioAnswers,
      body.timeTaken,
    );
  }

  @Get("speaking/sessions/:id")
  async getSpeakingSession(@Request() req: any, @Param("id") sessionId: string) {
    return this.advancedService.getSpeakingSession(req.user.id, sessionId);
  }

  @Get("speaking/history")
  async getSpeakingHistory(@Request() req: any) {
    return this.advancedService.getSpeakingHistory(req.user.id);
  }

  @Get("speaking/stats")
  async getSpeakingStats(@Request() req: any) {
    return this.advancedService.getSpeakingStatsForUser(req.user.id);
  }
}
