import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateExamDto,
  UpdateExamDto,
  CreateSessionDto,
  SubmitSessionDto,
} from './dto/exams.dto';
import { Exam, ExamSession } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    return this.prisma.exam.create({
      data: createExamDto,
    });
  }

  async findAll(): Promise<Exam[]> {
    return this.prisma.exam.findMany({
      where: { isPublished: true },
    });
  }

  async findOne(id: string): Promise<Exam | null> {
    return this.prisma.exam.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
    return this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
    });
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.prisma.exam.delete({
      where: { id },
    });
    return { message: 'Exam deleted successfully' };
  }

  async createSession(
    examId: string,
    createSessionDto: CreateSessionDto,
  ): Promise<ExamSession> {
    return this.prisma.examSession.create({
      data: {
        examId,
        userId: createSessionDto.userId,
        answers: {},
        status: 'IN_PROGRESS',
      },
    });
  }

  async submitSession(
    sessionId: string,
    submitDto: SubmitSessionDto,
  ): Promise<ExamSession> {
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
