import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async getExamNotes(userId: string, examId: string) {
    return this.prisma.questionNote.findMany({
      where: { userId, examId },
      orderBy: { questionNumber: 'asc' },
    });
  }

  async upsertNote(userId: string, examId: string, questionNumber: number, noteText: string) {
    return this.prisma.questionNote.upsert({
      where: { userId_examId_questionNumber: { userId, examId, questionNumber } },
      update: { noteText },
      create: { userId, examId, questionNumber, noteText },
    });
  }

  async deleteNote(id: string) {
    return this.prisma.questionNote.delete({ where: { id } });
  }
}
