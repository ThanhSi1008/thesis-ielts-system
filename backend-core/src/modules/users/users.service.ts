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
  avatar?: string | null;
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
        avatar: true,
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
        avatar: true,
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
          avatar: true,
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
    const examSessions = await this.prisma.ieltsIntensiveSession.findMany({
      where: { userId: studentId, status: "COMPLETED" },
      include: {
        ieltsIntensiveExam: {
          select: {
            id: true,
            title: true,
            type: true,
            duration: true,
            difficulty: true,
          },
        },
        ieltsIntensiveResult: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    const mockHistory = examSessions.map((s) => ({
      id: s.id,
      examId: s.examId,
      examTitle: (s.ieltsIntensiveExam as any).title,
      skill: (s.ieltsIntensiveExam as any).type,
      difficulty: (s.ieltsIntensiveExam as any).difficulty,
      dateTaken: (s as any).submittedAt ?? s.createdAt,
      durationMinutes: (s.ieltsIntensiveExam as any).duration,
      timeTaken: (s as any).timeTaken ?? null,
      rawScore: s.ieltsIntensiveResult?.totalScore ?? 0,
      writingScore: s.ieltsIntensiveResult?.writingScore ?? null,
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

  async updateAvatar(id: string, url: string | null): Promise<SafeUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { avatar: url },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        avatar: true,
      },
    });
    return user;
  }

  async addPushToken(userId: string, token: string, platform: string) {
    return this.prisma.pushToken.upsert({
      where: { token },
      update: { lastUsed: new Date(), userId },
      create: { userId, token, platform, lastUsed: new Date() },
    });
  }

  async removePushToken(userId: string, token: string) {
    return this.prisma.pushToken.deleteMany({
      where: { userId, token },
    });
  }

  async getRecentActivity(userId: string) {
    // 1. Fetch or create IELTS Profile
    let ieltsProfile = await this.prisma.ieltsProfile.findUnique({
      where: { userId },
    });
    if (!ieltsProfile) {
      try {
        ieltsProfile = await this.prisma.ieltsProfile.create({
          data: {
            userId,
            targetBand: 6.5,
            dailyCommitmentMins: 30,
          },
        });
      } catch (e) {
        // Fallback in case of race conditions
        ieltsProfile = await this.prisma.ieltsProfile.findUnique({
          where: { userId },
        });
      }
    }

    // 2. Fetch parallel activity data
    const [
      intensiveSessions,
      listeningSessions,
      readingSessions,
      writingSessions,
      speakingSessions,
      vocabProgress,
      grammarProgress,
      shadowingProgress,
      dictationProgress,
    ] = await Promise.all([
      this.prisma.ieltsIntensiveSession.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          ieltsIntensiveExam: { select: { title: true, type: true, duration: true } },
          ieltsIntensiveResult: true,
        },
      }),
      this.prisma.ieltsAdvancedListeningSession.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { part: { select: { title: true } } },
      }),
      this.prisma.ieltsAdvancedReadingSession.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { part: { select: { title: true } } },
      }),
      this.prisma.ieltsAdvancedWritingSession.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { prompt: { select: { title: true } } },
      }),
      this.prisma.ieltsAdvancedSpeakingSession.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { part: { select: { title: true } } },
      }),
      this.prisma.foundationVocabProgress.findMany({
        where: { userId },
        take: 10,
        orderBy: { updatedAt: "desc" },
        include: { unit: { include: { book: { select: { name: true } } } } },
      }),
      this.prisma.foundationGrammarProgress.findMany({
        where: { userId },
        take: 10,
        orderBy: { updatedAt: "desc" },
        include: { unit: { include: { book: { select: { name: true } } } } },
      }),
      this.prisma.shadowingProgress.findMany({
        where: { userId },
        take: 10,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.dictationProgress.findMany({
        where: { userId },
        take: 10,
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    // 3. Resolve Shadowing & Dictation Videos for details
    const shadowingVideoIds = shadowingProgress.map((p) => p.lessonId);
    const dictationVideoIds = dictationProgress.map((p) => p.lessonId);

    const [shadowingVideos, dictationVideos] = await Promise.all([
      this.prisma.shadowingVideo.findMany({
        where: { id: { in: shadowingVideoIds } },
        select: { id: true, title: true, category: true, sentences: true },
      }),
      this.prisma.dictationVideo.findMany({
        where: { id: { in: dictationVideoIds } },
        select: { id: true, title: true, category: true, sentences: true },
      }),
    ]);

    const shadowingVideoMap = new Map(shadowingVideos.map((v) => [v.id, v]));
    const dictationVideoMap = new Map(dictationVideos.map((v) => [v.id, v]));

    // 4. Map into Unified Activity List
    const allActivities: any[] = [];

    // Intensive (Mock Test)
    intensiveSessions.forEach((s) => {
      allActivities.push({
        id: s.id,
        type: "INTENSIVE",
        title: s.ieltsIntensiveExam?.title || "Mock Test",
        subtitle: s.ieltsIntensiveExam?.type || "Full Test",
        progressPercent: s.status === "COMPLETED" || s.status === "SUBMITTED" || s.status === "GRADED" ? 100 : 50,
        score: s.ieltsIntensiveResult?.totalScore ?? null,
        timestamp: s.updatedAt || s.createdAt,
        metadata: { examId: s.examId, status: s.status, timeTaken: s.timeTaken },
      });
    });

    // Listening
    listeningSessions.forEach((s) => {
      allActivities.push({
        id: s.id,
        type: "LISTENING",
        title: s.part?.title || "Listening Practice",
        subtitle: "Advanced Listening",
        progressPercent: 100,
        score: `${s.totalScore}/${s.totalQuestions}`,
        timestamp: s.createdAt,
        metadata: { partId: s.partId },
      });
    });

    // Reading
    readingSessions.forEach((s) => {
      allActivities.push({
        id: s.id,
        type: "READING",
        title: s.part?.title || "Reading Practice",
        subtitle: "Advanced Reading",
        progressPercent: 100,
        score: `${s.totalScore}/${s.totalQuestions}`,
        timestamp: s.createdAt,
        metadata: { partId: s.partId },
      });
    });

    // Writing
    writingSessions.forEach((s) => {
      allActivities.push({
        id: s.id,
        type: "WRITING",
        title: s.prompt?.title || "Writing Practice",
        subtitle: "Advanced Writing",
        progressPercent: s.status === "GRADED" || s.status === "COMPLETED" ? 100 : 50,
        score: s.bandScore != null ? s.bandScore.toString() : null,
        timestamp: s.updatedAt || s.createdAt,
        metadata: { promptId: s.promptId, status: s.status, timeTaken: s.timeTaken },
      });
    });

    // Speaking
    speakingSessions.forEach((s) => {
      allActivities.push({
        id: s.id,
        type: "SPEAKING",
        title: s.part?.title || "Speaking Practice",
        subtitle: "Advanced Speaking",
        progressPercent: s.status === "GRADED" || s.status === "COMPLETED" ? 100 : 50,
        score: s.bandScore != null ? s.bandScore.toString() : null,
        timestamp: s.updatedAt || s.createdAt,
        metadata: { partId: s.partId, status: s.status, timeTaken: s.timeTaken },
      });
    });

    // Vocabulary
    vocabProgress.forEach((p) => {
      allActivities.push({
        id: p.id,
        type: "VOCABULARY",
        title: p.unit?.title || "Vocabulary Study",
        subtitle: p.unit?.book?.name || "Vocabulary Book",
        progressPercent: p.totalWords > 0 ? Math.round((p.wordsLearned / p.totalWords) * 100) : 0,
        score: p.questionScore != null ? p.questionScore.toString() : null,
        timestamp: p.updatedAt || p.createdAt,
        metadata: { unitId: p.unitId, bookId: p.unit?.bookId },
      });
    });

    // Grammar
    grammarProgress.forEach((p) => {
      const grammarTotal = p.exerciseTotal || 0;
      const grammarScore = p.exerciseScore || 0;
      allActivities.push({
        id: p.id,
        type: "GRAMMAR",
        title: p.unit?.title || "Grammar Study",
        subtitle: p.unit?.book?.name || "Grammar Book",
        progressPercent: grammarTotal > 0 ? Math.round((grammarScore / grammarTotal) * 100) : (p.theoryCompleted ? 50 : 0),
        score: p.exerciseScore != null ? p.exerciseScore.toString() : null,
        timestamp: p.updatedAt || p.createdAt,
        metadata: { unitId: p.unitId, bookId: p.unit?.bookId },
      });
    });

    // Shadowing
    shadowingProgress.forEach((p) => {
      const video = shadowingVideoMap.get(p.lessonId);
      const totalSents = video?.sentences && Array.isArray(video.sentences) ? video.sentences.length : 1;
      allActivities.push({
        id: p.id,
        type: "SHADOWING",
        title: video?.title || "Shadowing Lesson",
        subtitle: video?.category || "Shadowing",
        progressPercent: Math.min(100, Math.round((p.completedSentences.length / totalSents) * 100)),
        score: p.completedSentences.length.toString(),
        timestamp: p.updatedAt || p.createdAt,
        metadata: { lessonId: p.lessonId },
      });
    });

    // Dictation
    dictationProgress.forEach((p) => {
      const video = dictationVideoMap.get(p.lessonId);
      const totalSents = video?.sentences && Array.isArray(video.sentences) ? video.sentences.length : 1;
      allActivities.push({
        id: p.id,
        type: "DICTATION",
        title: video?.title || "Dictation Lesson",
        subtitle: `Dictation (${p.difficulty})`,
        progressPercent: Math.min(100, Math.round((p.completedSentences.length / totalSents) * 100)),
        score: p.completedSentences.length.toString(),
        timestamp: p.updatedAt || p.createdAt,
        metadata: { lessonId: p.lessonId, difficulty: p.difficulty },
      });
    });

    // Sort by timestamp desc
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 5. Calculate Daily Goals Progress
    let todayMins = 0;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    for (const act of allActivities) {
      const actDate = new Date(act.timestamp);
      if (actDate >= startOfToday) {
        if (act.type === "INTENSIVE") {
          todayMins += act.metadata?.timeTaken ? Math.round(act.metadata.timeTaken / 60) : 40;
        } else if (["LISTENING", "READING", "WRITING", "SPEAKING"].includes(act.type)) {
          todayMins += act.metadata?.timeTaken ? Math.round(act.metadata.timeTaken / 60) : 15;
        } else if (["VOCABULARY", "GRAMMAR"].includes(act.type)) {
          todayMins += 10;
        } else if (["SHADOWING", "DICTATION"].includes(act.type)) {
          todayMins += 5;
        }
      }
    }

    const commitment = ieltsProfile.dailyCommitmentMins || 30;
    const progressPercent = Math.min(100, Math.round((todayMins / commitment) * 100));

    // 6. Generate active smart recommendations
    const recommendations: any[] = [];
    const types = new Set(allActivities.map((a) => a.type));

    if (!types.has("SPEAKING")) {
      recommendations.push({
        id: "rec-speaking",
        type: "SPEAKING",
        title: "Speaking Practice",
        description: "Speak on cue cards and get structured AI evaluation.",
        actionRoute: "/(tabs)/explore",
      });
    }
    if (!types.has("WRITING")) {
      recommendations.push({
        id: "rec-writing",
        type: "WRITING",
        title: "Writing Essay Master",
        description: "Draft critical essays on trending IELTS prompts.",
        actionRoute: "/(tabs)/explore",
      });
    }
    if (!types.has("VOCABULARY")) {
      recommendations.push({
        id: "rec-vocab",
        type: "VOCABULARY",
        title: "Academic Vocabulary",
        description: "Master level 7+ and level 8+ academic vocab units.",
        actionRoute: "/ielts/foundation",
      });
    }
    if (!types.has("GRAMMAR")) {
      recommendations.push({
        id: "rec-grammar",
        type: "GRAMMAR",
        title: "Advanced Grammar Rules",
        description: "Solidify core sentence and punctuation patterns.",
        actionRoute: "/ielts/foundation",
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        id: "rec-mock",
        type: "INTENSIVE",
        title: "Mock Exam Run",
        description: "Take a realistic practice exam under strict timing.",
        actionRoute: "/ielts/dashboard",
      });
    }

    return {
      streak: {
        currentStreak: ieltsProfile.currentStreak,
        longestStreak: ieltsProfile.longestStreak,
        dailyCommitmentMins: commitment,
        todayMins,
        progressPercent,
      },
      recentActivities: allActivities.slice(0, 15), // Return top 15
      recommendations,
    };
  }
}
