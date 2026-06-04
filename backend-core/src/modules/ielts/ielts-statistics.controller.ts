import { Controller, Get, UseGuards, Request, Query } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IeltsStatisticsService } from "./ielts-statistics.service";

@Controller("ielts-statistics")
@UseGuards(JwtAuthGuard)
export class IeltsStatisticsController {
  constructor(private readonly statisticsService: IeltsStatisticsService) {}

  @Get("overview")
  async getOverviewStats(@Request() req: any, @Query("studentId") studentId?: string) {
    return this.statisticsService.getOverviewStats(studentId || req.user.id);
  }

  @Get("foundation")
  async getFoundationStats(@Request() req: any, @Query("studentId") studentId?: string) {
    return this.statisticsService.getFoundationStats(studentId || req.user.id);
  }

  @Get("basic")
  async getBasicStats(@Request() req: any, @Query("studentId") studentId?: string) {
    return this.statisticsService.getBasicStats(studentId || req.user.id);
  }

  @Get("advanced")
  async getAdvancedStats(@Request() req: any, @Query("studentId") studentId?: string) {
    return this.statisticsService.getAdvancedStats(studentId || req.user.id);
  }

  @Get("intensive")
  async getIntensiveStats(@Request() req: any, @Query("studentId") studentId?: string) {
    return this.statisticsService.getIntensiveStats(studentId || req.user.id);
  }
}
