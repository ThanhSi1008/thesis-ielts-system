import { Controller, Get, Post, Body, UseGuards, Request } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AdminGrantDto } from "./dto/subscriptions.dto";

@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * GET /api/v1/subscriptions/plans — Public, list pricing plans
   */
  @Get("plans")
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  /**
   * GET /api/v1/subscriptions/me — Get current user's subscription + usage
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMySubscription(@Request() req: any) {
    return this.subscriptionsService.getMySubscription(req.user.id);
  }

  /**
   * GET /api/v1/subscriptions/usage — Get current period usage stats
   */
  @Get("usage")
  @UseGuards(JwtAuthGuard)
  async getUsage(@Request() req: any) {
    const sub = await this.subscriptionsService.getOrCreateSubscription(req.user.id);
    return this.subscriptionsService.getCurrentUsage(sub.id);
  }

  /**
   * POST /api/v1/subscriptions/admin/grant — Admin grants subscription
   */
  @Post("admin/grant")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async adminGrant(@Body() dto: AdminGrantDto) {
    const days = dto.durationDays ? parseInt(dto.durationDays) : 30;
    return this.subscriptionsService.adminGrant(dto.userId, dto.tier, days);
  }
}
