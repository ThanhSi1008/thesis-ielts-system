import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ResultsService } from "./results.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("results")
@UseGuards(JwtAuthGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get("user/:userId")
  findByUser(@Param("userId") userId: string) {
    return this.resultsService.findByUser(userId);
  }

  @Get("session/:sessionId")
  findBySession(@Param("sessionId") sessionId: string) {
    return this.resultsService.findBySession(sessionId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.resultsService.findOne(id);
  }
}
