import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationType } from "@prisma/client";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /** Create a single notification for a user and trigger push notification */
  async create(dto: CreateNotificationDto) {
    const notif = await this.prisma.notification.create({ data: dto });

    // Send push notification asynchronously
    this.sendPushNotification(dto.userId, dto.title, dto.body, {
      id: notif.id,
      type: dto.type,
      link: dto.link,
    }).catch((err) => {
      this.logger.error(`Failed to trigger async push: ${err.message}`);
    });

    return notif;
  }

  /** Send push notification via Expo Push API */
  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    const tokens = await this.prisma.pushToken.findMany({
      where: { userId },
    });

    if (tokens.length === 0) {
      return;
    }

    const payloads = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body,
      data,
    }));

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(payloads),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`Expo API error: ${response.status} ${errText}`);
        return;
      }

      const resJson: any = await response.json();
      const results = resJson.data || [];

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const tokenObj = tokens[i];
        if (result.status === "error") {
          this.logger.warn(`Failed to send push to token ${tokenObj.token}: ${result.message}`);
          if (result.details?.error === "DeviceNotRegistered") {
            this.logger.log(`Removing unregistered/expired push token: ${tokenObj.token}`);
            await this.prisma.pushToken.delete({ where: { id: tokenObj.id } }).catch(() => {});
          }
        } else {
          // Update lastUsed
          await this.prisma.pushToken.update({
            where: { id: tokenObj.id },
            data: { lastUsed: new Date() },
          }).catch(() => {});
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to send push notifications to user ${userId}: ${error.message}`);
    }
  }

  /** Cron cleanup token > 90 ngày unused */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredPushTokens() {
    this.logger.log("Starting cleanup of expired push tokens...");
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await this.prisma.pushToken.deleteMany({
      where: {
        lastUsed: {
          lt: ninetyDaysAgo,
        },
      },
    });

    this.logger.log(`Cleanup completed. Deleted ${result.count} expired push tokens.`);
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
