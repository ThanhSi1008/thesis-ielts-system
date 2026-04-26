import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PrismaService } from "../../common/prisma/prisma.service";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  /** GET /notifications?page=1&limit=20 */
  @Get()
  findAll(
    @Request() req: any,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.notificationsService.findAll(req.user.id, page, limit);
  }

  /** GET /notifications/unread-count */
  @Get("unread-count")
  getUnreadCount(@Request() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  /** PATCH /notifications/read-all */
  @Patch("read-all")
  markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  /** PATCH /notifications/:id/read */
  @Patch(":id/read")
  markAsRead(@Param("id") id: string, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  /** DELETE /notifications/:id */
  @Delete(":id")
  delete(@Param("id") id: string, @Request() req: any) {
    return this.notificationsService.delete(id, req.user.id);
  }

  /**
   * POST /notifications/test
   * Dev-only: Creates a test notification for the logged-in user.
   */
  @Post("test")
  createTest(@Request() req: any) {
    return this.notificationsService.notifySystemAnnouncement(
      req.user.id,
      "🎉 Welcome to Notifications!",
      "Your notification system is working. You will receive updates about your streaks, exams, and lessons here.",
      "/",
    );
  }

  /**
   * POST /notifications/broadcast
   * Body: { title, body, link? }
   * Sends a system announcement to ALL users. Intended for admin use.
   */
  @Post("broadcast")
  async broadcast(@Body() dto: { title: string; body: string; link?: string }) {
    const users = await this.prisma.user.findMany({ select: { id: true } });
    const results = await Promise.allSettled(
      users.map((u) =>
        this.notificationsService.notifySystemAnnouncement(
          u.id,
          dto.title,
          dto.body,
          dto.link,
        ),
      ),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    return { message: `Broadcast sent to ${succeeded}/${users.length} users.` };
  }
}
