import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";

// Define a type for user data without password
export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SafeUser[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return users;
  }

  async findOne(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          firstName: updateUserDto.firstName,
          lastName: updateUserDto.lastName,
          email: updateUserDto.email,
          isActive: updateUserDto.isActive,
          role: updateUserDto.role as any,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });
      return user;
    } catch (error) {
      if (error.code === "P2002") {
        throw new BadRequestException("Email already in use by another account");
      }
      throw error;
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: "User deleted successfully" };
  }

  // --- Student-Teacher Linking ---

  async linkTeacher(studentId: string, teacherId: string) {
    // Verify teacher exists and is an instructor/teacher
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new Error("Teacher ID does not exist in the system");
    }

    if (studentId === teacherId) {
      throw new Error("Students cannot link to themselves");
    }

    return this.prisma.studentTeacherLink.upsert({
      where: {
        studentId_teacherId: {
          studentId,
          teacherId,
        },
      },
      update: {
        status: "LINKED", // In case they were previously unlinked/pending
      },
      create: {
        studentId,
        teacherId,
        status: "LINKED",
      },
    });
  }

  async getLinkedTeachers(studentId: string) {
    const links = await this.prisma.studentTeacherLink.findMany({
      where: { studentId, status: "LINKED" },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
    return links;
  }

  async getLinkedStudents(teacherId: string) {
    const links = await this.prisma.studentTeacherLink.findMany({
      where: { teacherId, status: "LINKED" },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
    return links;
  }

  async unlinkTeacher(studentId: string, teacherId: string) {
    return this.prisma.studentTeacherLink.delete({
      where: {
        studentId_teacherId: {
          studentId,
          teacherId,
        },
      },
    });
  }

  async getStudentStats(teacherId: string, studentId: string) {
    // 1. Verify link
    const link = await this.prisma.studentTeacherLink.findUnique({
      where: { studentId_teacherId: { studentId, teacherId } },
    });

    if (!link || link.status !== "LINKED") {
      throw new Error("Not linked to this student");
    }

    // 2. Fetch IELTS profile + user info
    const ieltsProfile = await this.prisma.ieltsProfile.findUnique({
      where: { userId: studentId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // 3. Fetch completed mock test sessions (shaped like /exams/history)
    const examSessions = await this.prisma.examSession.findMany({
      where: { userId: studentId, status: "COMPLETED" },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
            difficulty: true,
          },
        },
        result: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    const mockHistory = examSessions.map((s) => ({
      id: s.id,
      examId: s.examId,
      examTitle: (s.exam as any).title,
      skill: (s.exam as any).type,
      difficulty: (s.exam as any).difficulty,
      dateTaken: (s as any).submittedAt ?? s.createdAt,
      durationMinutes: (s.exam as any).duration,
      timeTaken: (s as any).timeTaken ?? null,
      rawScore: s.result?.totalScore ?? 0,
      writingScore: s.result?.writingScore ?? null,
      maxScore: 40,
      practicePart: (s as any).practicePart ?? null,
    }));

    // 4. Fetch advanced listening practice history
    const listeningHistory = await this.prisma.ieltsAdvancedListeningSession.findMany({
      where: { userId: studentId },
      include: { part: { select: { id: true, title: true } } },
      orderBy: { createdAt: "desc" },
    });

    const advancedListeningHistory = listeningHistory.map((h) => ({
      id: h.id,
      partId: h.partId,
      skill: "LISTENING",
      examTitle: (h.part as any)?.title || "Listening Practice",
      dateTaken: h.createdAt,
      practicePart: true,
      maxScore: h.totalQuestions,
      rawScore: h.totalScore,
      examId: h.partId,
      totalScore: h.totalScore,
      totalQuestions: h.totalQuestions,
      createdAt: h.createdAt,
      part: h.part,
    }));

    // 5. Fetch advanced reading practice history
    const readingHistory =
      await this.prisma.ieltsAdvancedReadingSession.findMany({
        where: { userId: studentId },
        include: { part: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
      });

    const advancedReadingHistory = readingHistory.map((h) => ({
      id: h.id,
      partId: h.partId,
      skill: "READING",
      examTitle: (h.part as any)?.title || "Reading Practice",
      dateTaken: h.createdAt,
      practicePart: true,
      maxScore: h.totalQuestions,
      rawScore: h.totalScore,
      examId: h.partId,
      totalScore: h.totalScore,
      totalQuestions: h.totalQuestions,
      createdAt: h.createdAt,
      part: h.part,
    }));

    return {
      profile: ieltsProfile,
      streak: {
        currentStreak: ieltsProfile?.currentStreak ?? 0,
        longestStreak: ieltsProfile?.longestStreak ?? 0,
      },
      mockHistory,
      advancedListeningHistory,
      advancedReadingHistory,
    };
  }
}
