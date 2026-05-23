import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.ieltsIntensiveResult.findMany({
      where: { userId },
      include: {
        ieltsIntensiveSession: {
          include: {
            ieltsIntensiveExam: true,
          },
        },
      },
      orderBy: {
        gradedAt: "desc",
      },
    });
  }

  async findBySession(sessionId: string, authUserId: string) {
    const session = await this.prisma.ieltsIntensiveSession.findUnique({
      where: { id: sessionId },
    });

    // Return 404 for both missing and cross-user cases — avoids leaking session existence
    if (!session || session.userId !== authUserId) {
      throw new NotFoundException("Session not found");
    }

    const result = await this.prisma.ieltsIntensiveResult.findUnique({
      where: { sessionId },
    });

    if (result) {
      return {
        status: session.status,
        result: {
          band: result.totalScore,
          feedback: result.feedback,
          readingScore: result.readingScore,
          listeningScore: result.listeningScore,
          speakingScore: result.speakingScore,
          writingScore: result.writingScore,
        },
      };
    }

    if (session.status === "GRADING_FAILED") {
      return {
        status: session.status,
        result: null,
        error: "AI grading failed. Please retry from your history.",
      };
    }

    return {
      status: session.status,
      result: null,
    };
  }

  async findOne(id: string) {
    return this.prisma.ieltsIntensiveResult.findUnique({
      where: { id },
    });
  }
}
