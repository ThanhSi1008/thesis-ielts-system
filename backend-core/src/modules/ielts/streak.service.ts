import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class StreakService {
  private readonly logger = new Logger(StreakService.name);
  private readonly STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Called to record an activity and conditionally increment the streak.
   * Forces a refresh.
   */
  async recordActivity(userId: string) {
    try {
      const profile = await this.prisma.ieltsProfile.findUnique({
        where: { userId },
      });

      if (!profile) return null;

      const now = new Date();
      // Normalize today to start of day
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // If they don't have a start date yet, this is their first activity
      if (!profile.lastActiveDate) {
        return this.prisma.ieltsProfile.update({
          where: { id: profile.id },
          // @ts-ignore: VS Code caches old Prisma types, suppressing IDE complaint.
          data: {
            currentStreak: 1,
            longestStreak: Math.max(1, profile.longestStreak),
            lastActiveDate: today,
          },
        });
      }

      // Normalize lastActiveDate to start of day
      const lastActive = new Date(
        profile.lastActiveDate.getFullYear(),
        profile.lastActiveDate.getMonth(),
        profile.lastActiveDate.getDate(),
      );

      // Check difference in days
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Already recorded activity for today, no-op
        return profile;
      } else if (diffDays === 1) {
        // Did activity yesterday -> increment streak
        const newStreak = profile.currentStreak + 1;
        const updated = await this.prisma.ieltsProfile.update({
          where: { id: profile.id },
          // @ts-ignore: VS Code caches old Prisma types, suppressing IDE complaint.
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, profile.longestStreak),
            lastActiveDate: today,
          },
        });
        // Fire milestone notification (non-blocking)
        if (this.STREAK_MILESTONES.includes(newStreak)) {
          this.notifications
            .notifyStreakMilestone(userId, newStreak)
            .catch(() => {});
        }
        return updated;
      } else {
        // Missed yesterday -> reset streak to 1
        return this.prisma.ieltsProfile.update({
          where: { id: profile.id },
          // @ts-ignore: VS Code caches old Prisma types, suppressing IDE complaint.
          data: {
            currentStreak: 1,
            lastActiveDate: today,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to record streak activity for user ${userId}`,
        error,
      );
      return null;
    }
  }

  /**
   * Get the current streak info for the user.
   */
  async getStreak(userId: string) {
    const profile = await this.prisma.ieltsProfile.findUnique({
      where: { userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    if (!profile) {
      return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
    }

    // Check if the streak was broken due to inactivity today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let currentStreak = profile.currentStreak;
    if (profile.lastActiveDate) {
      const lastActive = new Date(
        profile.lastActiveDate.getFullYear(),
        profile.lastActiveDate.getMonth(),
        profile.lastActiveDate.getDate(),
      );
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        currentStreak = 0; // The streak is visually broken until they do an activity today to start 1
      }
    }

    return {
      currentStreak,
      longestStreak: profile.longestStreak,
      lastActiveDate: profile.lastActiveDate,
    };
  }
}
