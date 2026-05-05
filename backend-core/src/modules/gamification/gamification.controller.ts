import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { GamificationService } from "./gamification.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("gamification")
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get("profile")
  async getProfile(@Request() req: any) {
    return this.gamificationService.getProfile(req.user.id);
  }

  @Get("achievements")
  async getAchievements(@Request() req: any) {
    return this.gamificationService.getAchievements(req.user.id);
  }

  @Get("leaderboard")
  async getLeaderboard(
    @Query("type") type: string = "xp_weekly",
    @Query("limit") limit: string = "20",
  ) {
    return this.gamificationService.getLeaderboard(type, parseInt(limit));
  }

  @Get("xp-history")
  async getXpHistory(@Request() req: any) {
    return this.gamificationService.getXpHistory(req.user.id);
  }
}
