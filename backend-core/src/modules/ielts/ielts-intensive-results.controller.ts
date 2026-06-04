import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { IeltsIntensiveService } from "./ielts-intensive.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("results")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class IeltsIntensiveResultsController {
  constructor(private readonly intensiveService: IeltsIntensiveService) {}

  @Get("user/:userId")
  findByUser(@Param("userId") userId: string) {
    return this.intensiveService.findResultByUser(userId);
  }

  @Get("session/:sessionId")
  findBySession(@Param("sessionId") sessionId: string) {
    return this.intensiveService.findResultBySession(sessionId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.intensiveService.findResultById(id);
  }
}
