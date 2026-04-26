import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ResultsService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string) {
    return this.prisma.result.findMany({
      where: { userId },
      include: {
        session: {
          include: {
            exam: true,
          },
        },
      },
      orderBy: {
        gradedAt: 'desc',
      },
    });
  }

  async findBySession(sessionId: string) {
    return this.prisma.result.findUnique({
      where: { sessionId },
      include: {
        session: {
          include: {
            exam: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.result.findUnique({
      where: { id },
    });
  }
}

