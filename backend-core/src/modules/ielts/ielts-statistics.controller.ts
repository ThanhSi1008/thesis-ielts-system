import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { IeltsStatisticsService } from "./ielts-statistics.service";

@Controller("ielts-statistics")
@UseGuards(JwtAuthGuard)
export class IeltsStatisticsController {
  constructor(private readonly statisticsService: IeltsStatisticsService) {}

  @Get("overview")
  async getOverviewStats(@Request() req: any) {
    return this.statisticsService.getOverviewStats(req.user.id);
  }

  @Get("foundation")
  async getFoundationStats(@Request() req: any) {
    return this.statisticsService.getFoundationStats(req.user.id);
  }

  @Get("basic")
  async getBasicStats(@Request() req: any) {
    return this.statisticsService.getBasicStats(req.user.id);
  }

  @Get("advanced")
  async getAdvancedStats(@Request() req: any) {
    return this.statisticsService.getAdvancedStats(req.user.id);
  }

  @Get("intensive")
  async getIntensiveStats(@Request() req: any) {
    return this.statisticsService.getIntensiveStats(req.user.id);
  }
}
