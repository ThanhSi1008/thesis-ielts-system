import { Controller, Get, Post, Body, UseGuards, Request } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AdminGrantDto, CheckoutDto, CancelSubscriptionDto } from "./dto/subscriptions.dto";

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
   * GET /api/v1/subscriptions/payments — Payment history
   */
  @Get("payments")
  @UseGuards(JwtAuthGuard)
  async getPaymentHistory(@Request() req: any) {
    return this.subscriptionsService.getPaymentHistory(req.user.id);
  }

  /**
   * POST /api/v1/subscriptions/checkout — Create checkout session
   * Mock: auto-completes and activates subscription immediately.
   */
  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  async checkout(@Request() req: any, @Body() dto: CheckoutDto) {
    return this.subscriptionsService.checkout(req.user.id, dto.planId);
  }

  /**
   * POST /api/v1/subscriptions/start-trial — Start 7-day Premium trial
   * Only available once per user, only if currently on FREE tier.
   */
  @Post("start-trial")
  @UseGuards(JwtAuthGuard)
  async startTrial(@Request() req: any) {
    return this.subscriptionsService.startTrial(req.user.id);
  }

  /**
   * POST /api/v1/subscriptions/cancel — Cancel subscription
   * Access continues until end of the current billing period.
   */
  @Post("cancel")
  @UseGuards(JwtAuthGuard)
  async cancelSubscription(@Request() req: any, @Body() dto: CancelSubscriptionDto) {
    return this.subscriptionsService.cancelSubscription(req.user.id, dto.reason);
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

  /**
   * GET /api/v1/subscriptions/admin/overview — Admin stats and subscriptions list
   */
  @Get("admin/overview")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async getAdminOverview() {
    return this.subscriptionsService.getAdminOverview();
  }
}
