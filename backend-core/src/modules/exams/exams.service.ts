import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateExamDto,
  UpdateExamDto,
  CreateSessionDto,
  SubmitSessionDto,
} from './dto/exams.dto';
import { Exam, ExamSession, ExamType, SessionStatus } from '@prisma/client';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  private parseCambridgeTitle(input: string): {
    groupId: string;
    groupTitle: string;
    testNumber: number;
    skill: ExamType;
  } | null {
    // Expected examples:
    // "Cambridge IELTS 17 - Listening Test 1"
    // "Cambridge IELTS 16 - Reading Test 4"
    const re =
      /^Cambridge IELTS\s*(\d+)\s*-\s*(Listening|Reading|Writing|Speaking)\s*Test\s*(\d+)\s*$/i;
    const m = input.trim().match(re);
    if (!m) return null;
    const bookNumber = Number(m[1]);
    const rawSkill = m[2].toLowerCase();
    const testNumber = Number(m[3]);

    const skillMap: Record<string, ExamType> = {
      listening: ExamType.LISTENING,
      reading: ExamType.READING,
      writing: ExamType.WRITING,
      speaking: ExamType.SPEAKING,
    };

    const skill = skillMap[rawSkill];
    if (!skill || !Number.isFinite(bookNumber) || !Number.isFinite(testNumber)) return null;

    return {
      groupId: `cambridge-${bookNumber}`,
      groupTitle: `Cambridge IELTS ${bookNumber}`,
      testNumber,
      skill,
    };
  }

  private normalizeSkill(skill?: string): ExamType {
    const s = (skill || '').toUpperCase().trim();
    const allowed = new Set<ExamType>([
      ExamType.LISTENING,
      ExamType.READING,
      ExamType.WRITING,
      ExamType.SPEAKING,
    ]);
    if (!s) return ExamType.READING; // screenshot default is Reading tab selected
    if (!allowed.has(s as ExamType)) {
      throw new BadRequestException(
        `Invalid skill. Expected one of: LISTENING, READING, WRITING, SPEAKING`,
      );
    }
    return s as ExamType;
  }

  async getIntensiveCatalog(params: { userId: string; skill?: string }) {
    const skill = this.normalizeSkill(params.skill);

    const exams = await this.prisma.exam.findMany({
      where: {
        isPublished: true,
        type: skill,
      },
      select: {
        id: true,
        title: true,
        duration: true,
        difficulty: true,
        type: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = exams
      .map((e) => ({ exam: e, meta: this.parseCambridgeTitle(e.title) }))
      .filter((x) => x.meta !== null) as Array<{
      exam: (typeof exams)[number];
      meta: NonNullable<ReturnType<ExamsService['parseCambridgeTitle']>>;
    }>;

    const examIds = parsed.map((p) => p.exam.id);

    // Participants: count distinct userId per exam from sessions.
    const sessions = await this.prisma.examSession.findMany({
      where: { examId: { in: examIds } },
      select: { examId: true, userId: true, status: true },
    });

    const participantsByExam = new Map<string, Set<string>>();
    const completedByExam = new Map<string, number>();

    for (const s of sessions) {
      const set = participantsByExam.get(s.examId) ?? new Set<string>();
      set.add(s.userId);
      participantsByExam.set(s.examId, set);

      if (s.status === SessionStatus.COMPLETED) {
        completedByExam.set(s.examId, (completedByExam.get(s.examId) ?? 0) + 1);
      }
    }

    // Results drive "myScore" (latest result per exam for current user).
    const myResults = await this.prisma.result.findMany({
      where: {
        userId: params.userId,
        session: { examId: { in: examIds } },
      },
      select: {
        totalScore: true,
        gradedAt: true,
        session: { select: { examId: true, submittedAt: true } },
      },
      orderBy: { gradedAt: 'desc' },
    });

    const myScoreByExam = new Map<
      string,
      { score: number; gradedAt: Date; submittedAt: Date | null }
    >();

    for (const r of myResults) {
      const existing = myScoreByExam.get(r.session.examId);
      if (!existing) {
        myScoreByExam.set(r.session.examId, {
          score: r.totalScore,
          gradedAt: r.gradedAt,
          submittedAt: r.session.submittedAt,
        });
      }
    }

    // Group into Cambridge sets.
    const groupsMap = new Map<
      string,
      {
        id: string;
        title: string;
        participantsCount: number;
        completedCount: number;
        tests: Array<{
          examId: string;
          testNumber: number;
          durationMinutes: number;
          difficulty: string;
          myScore?: number;
          participantsCount: number;
          completedCount: number;
        }>;
      }
    >();

    for (const p of parsed) {
      const g =
        groupsMap.get(p.meta.groupId) ??
        {
          id: p.meta.groupId,
          title: p.meta.groupTitle,
          participantsCount: 0,
          completedCount: 0,
          tests: [],
        };

      const participantsCount = participantsByExam.get(p.exam.id)?.size ?? 0;
      const completedCount = completedByExam.get(p.exam.id) ?? 0;
      const myScore = myScoreByExam.get(p.exam.id)?.score;

      g.tests.push({
        examId: p.exam.id,
        testNumber: p.meta.testNumber,
        durationMinutes: p.exam.duration,
        difficulty: p.exam.difficulty,
        myScore,
        participantsCount,
        completedCount,
      });

      g.participantsCount += participantsCount;
      g.completedCount += completedCount;

      groupsMap.set(p.meta.groupId, g);
    }

    const groups = Array.from(groupsMap.values())
      .map((g) => ({
        ...g,
        tests: g.tests.sort((a, b) => a.testNumber - b.testNumber),
      }))
      .sort((a, b) => {
        // Sort by book number desc when possible.
        const an = Number(a.id.replace('cambridge-', ''));
        const bn = Number(b.id.replace('cambridge-', ''));
        if (Number.isFinite(an) && Number.isFinite(bn)) return bn - an;
        return a.title.localeCompare(b.title);
      });

    return { skill, groups };
  }

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
