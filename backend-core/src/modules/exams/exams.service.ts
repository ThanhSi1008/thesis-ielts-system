import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(createExamDto: any) {
    return this.prisma.exam.create({
      data: createExamDto,
    });
  }

  async findAll() {
    return this.prisma.exam.findMany({
      where: { isPublished: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.exam.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateExamDto: any) {
    return this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
    });
  }

  async remove(id: string) {
    return this.prisma.exam.delete({
      where: { id },
    });
  }

  async createSession(examId: string, createSessionDto: any) {
    return this.prisma.examSession.create({
      data: {
        examId,
        userId: createSessionDto.userId,
        answers: {},
        status: 'IN_PROGRESS',
      },
    });
  }

  async submitSession(sessionId: string, submitDto: any) {
    // Update session with answers and mark as submitted
    const session = await this.prisma.examSession.update({
      where: { id: sessionId },
      data: {
        answers: submitDto.answers,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    // TODO: Publish grading task to RabbitMQ for AI Service
    // This will be implemented in the ai-client module

    return session;
  }
}

