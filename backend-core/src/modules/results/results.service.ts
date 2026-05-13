import { Injectable } from "@nestjs/common";
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

  async findBySession(sessionId: string) {
    return this.prisma.ieltsIntensiveResult.findUnique({
      where: { sessionId },
      include: {
        ieltsIntensiveSession: {
          include: {
            ieltsIntensiveExam: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.ieltsIntensiveResult.findUnique({
      where: { id },
    });
  }
}
