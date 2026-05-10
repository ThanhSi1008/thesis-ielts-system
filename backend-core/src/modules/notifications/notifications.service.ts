import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationType } from "@prisma/client";
import { CreateNotificationDto } from "./dto/create-notification.dto";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /** Create a single notification for a user */
  async create(dto: CreateNotificationDto) {
    return this.prisma.notification.create({ data: dto });
  }

  /** Get paginated notifications for a user (newest first) */
  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { notifications, total, page, limit };
  }

  /** Return only the unread count — lightweight for polling */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  /** Mark a single notification as read */
  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  /** Mark all notifications for a user as read */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  /** Delete a single notification */
  async delete(id: string, userId: string) {
    return this.prisma.notification.deleteMany({ where: { id, userId } });
  }

  // ────────────────────────────────────────────────────────────
  // Convenience helpers — called by other services
  // ────────────────────────────────────────────────────────────

  async notifyStreakMilestone(userId: string, days: number) {
    return this.create({
      userId,
      type: NotificationType.STREAK_MILESTONE,
      title: `🔥 ${days}-day streak!`,
      body: `You've maintained your learning streak for ${days} days in a row. Keep it up!`,
      icon: "🔥",
      link: "/ielts",
    });
  }

  async notifyDictationComplete(
    userId: string,
    lessonTitle: string,
    lessonId: string,
  ) {
    return this.create({
      userId,
      type: NotificationType.DICTATION_COMPLETE,
      title: "🎧 Dictation Completed!",
      body: `You finished all sentences in "${lessonTitle}". Great job!`,
      icon: "🎧",
      link: `/shadowing-dictation/${lessonId}/dictation`,
    });
  }

  async notifyExamGraded(userId: string, examTitle: string, sessionId: string) {
    return this.create({
      userId,
      type: NotificationType.EXAM_GRADED,
      title: "📝 IeltsIntensiveExam Graded",
      body: `Your submission for "${examTitle}" has been graded. Tap to see your results.`,
      icon: "📝",
      link: `/ielts`,
    });
  }

  async notifySystemAnnouncement(
    userId: string,
    title: string,
    body: string,
    link?: string,
  ) {
    return this.create({
      userId,
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      title,
      body,
      icon: "📢",
      link,
    });
  }
}
