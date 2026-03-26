import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  CreateExamDto,
  UpdateExamDto,
  CreateSessionDto,
  SubmitSessionDto,
  WritingResultCallbackDto,
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
        imageUrl: true,
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
        imageUrl?: string;
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
          imageUrl: p.exam.imageUrl || undefined,
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
  async getHistory(userId: string) {
    const sessions = await this.prisma.examSession.findMany({
      where: { userId, status: 'COMPLETED' },
      include: {
        exam: { select: { title: true, type: true, duration: true } },
        result: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      examId: s.examId,
      examTitle: s.exam.title,
      skill: s.exam.type,
      dateTaken: s.submittedAt ?? s.createdAt,
      durationMinutes: s.exam.duration,
      timeTaken: s.timeTaken ?? null,
      rawScore: s.result?.totalScore ?? 0,
      writingScore: s.result?.writingScore ?? null,
      maxScore: 40,
    }));
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

  private parseIELTSAnswer(correct: string): string[] {
    const parts = correct.split('/').map(p => p.trim());
    const results: string[] = [];
    
    for (const part of parts) {
      if (part.includes('(') && part.includes(')')) {
        const match = part.match(/(.*)\((.*?)\)(.*)/);
        if (match) {
          const [, prefix, optional, suffix] = match;
          results.push((prefix + suffix).trim());
          results.push((prefix + optional + suffix).trim());
        } else {
          results.push(part);
        }
      } else {
        results.push(part);
      }
    }
    return results.map(s => s.toLowerCase().replace(/[^a-z0-9]/g, ''));
  }
  
  private isAnswerCorrect(userAns: string, correctAns: any): boolean {
    if (!userAns || String(userAns).trim() === '') return false;
    const userNormalized = String(userAns).toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const correctArr = Array.isArray(correctAns) ? correctAns : [String(correctAns)];
    
    for (const c of correctArr) {
      const validSet = this.parseIELTSAnswer(String(c));
      if (validSet.includes(userNormalized)) return true;
    }
    return false;
  }

  private extractCorrectAnswers(obj: any, ansMap: Map<string, any>) {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        obj.forEach(x => this.extractCorrectAnswers(x, ansMap));
      } else {
        // Some nodes have "question_number," others "question_numbers"
        const ans = obj.correct_answer !== undefined ? obj.correct_answer 
                  : obj.answer !== undefined ? obj.answer 
                  : obj.correct_answers;
        if (typeof obj.question_number === "number" && ans !== undefined) {
          ansMap.set(String(obj.question_number), ans);
        } else if (Array.isArray(obj.question_numbers) && ans !== undefined) {
          const key = (obj.question_numbers as number[]).join(',');
          ansMap.set(key, ans);
        } else {
          Object.values(obj).forEach(x => this.extractCorrectAnswers(x, ansMap));
        }
      }
    }
  }

  async submitSession(
    sessionId: string,
    submitDto: SubmitSessionDto,
  ): Promise<ExamSession & { result?: any }> {
    // 1. Fetch the existing session and exam details
    const existing = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: { exam: true },
    });

    if (!existing) {
      throw new BadRequestException('Exam session not found.');
    }

    let status: SessionStatus = 'SUBMITTED';
    let totalScore = 0;
    let graded = false;

    // 2. Synchronous grading for IELTS LISTENING and READING
    if (
      existing.exam.type === ExamType.LISTENING ||
      existing.exam.type === ExamType.READING
    ) {
      const ansMap = new Map<string, any>();
      this.extractCorrectAnswers(existing.exam.questions, ansMap);

      for (const [key, correct] of ansMap.entries()) {
        const userAns = submitDto.answers[key];
        
        if (key.includes(',')) {
          // Multi-select / multi-question mapping (e.g. "21,22")
          const qCount = key.split(',').length;
          const correctArr = Array.isArray(correct) ? correct : [String(correct)];
          const userArr = key.split(',').map(k => String(submitDto.answers[k] || '')).filter(v => v.trim() !== '');
          
          let multiScore = 0;
          const correctNorm = correctArr.flatMap(c => this.parseIELTSAnswer(String(c)));
          for (const ua of userArr) {
            const uan = String(ua).toLowerCase().replace(/[^a-z0-9]/g, '');
            const idx = correctNorm.indexOf(uan);
            if (idx !== -1) {
              multiScore++;
              correctNorm.splice(idx, 1);
            }
          }
          totalScore += Math.min(multiScore, qCount);
        } else {
          // Exact single question
          if (this.isAnswerCorrect(String(userAns || ''), correct)) {
            totalScore++;
          }
        }
      }
      
      status = 'COMPLETED';
      graded = true;
    }

    // 2b. WRITING & SPEAKING: AI grading
    const isWriting = existing.exam.type === ExamType.WRITING;
    const isSpeaking = existing.exam.type === ExamType.SPEAKING;
    if (isWriting || isSpeaking) {
      status = 'SUBMITTED';
    }

    // 3. Update session with answers and status
    const session = await this.prisma.examSession.update({
      where: { id: sessionId },
      data: {
        answers: submitDto.answers,
        timeTaken: submitDto.timeTaken,
        status,
        submittedAt: new Date(),
      },
    });

    // 4. Create or Update Result if graded
    let resultRecord: any = null;
    if (graded) {
      const resultData = {
        userId: existing.userId,
        sessionId: existing.id,
        totalScore,
        listeningScore: existing.exam.type === ExamType.LISTENING ? totalScore : null,
        readingScore: existing.exam.type === ExamType.READING ? totalScore : null,
        gradedAt: new Date(),
      };

      resultRecord = await this.prisma.result.upsert({
        where: { sessionId: existing.id },
        update: resultData,
        create: resultData,
      });
    }

    // 5. Synchronous AI grader for Writing
    if (isWriting) {
      try {
        const aiResponse = await this.triggerWritingGrader(
          session.id,
          submitDto.answers as Record<string, any>,
          existing.exam.questions,
        );
        const writingScore = aiResponse.overallBand || 0;
        
        const resultData = {
          userId: existing.userId,
          sessionId: session.id,
          totalScore: writingScore,
          listeningScore: null,
          readingScore: null,
          writingScore: writingScore,
          feedback: aiResponse.feedback as any,
          gradedAt: new Date(),
        };

        resultRecord = await this.prisma.result.upsert({
          where: { sessionId: session.id },
          update: resultData,
          create: resultData,
        });

        status = 'COMPLETED';
        graded = true;
      } catch (err: any) {
        console.error('[Writing] Synchronous grading failed:', err.message);
        if (err.status === 503 || err.status === 429) {
          throw new ServiceUnavailableException(err.message);
        }
        throw new BadRequestException('Writing grading failed: ' + err.message);
      }
    }

    // 6. Synchronous AI grader for Speaking
    if (isSpeaking) {
      try {
        const aiResponse = await this.triggerSpeakingGrader(
          session.id,
          submitDto.answers as Record<string, any>,
          existing.exam.questions,
        );
        const speakingScore = aiResponse.overallBand || 0;
        
        const resultData = {
          userId: existing.userId,
          sessionId: session.id,
          totalScore: speakingScore,
          listeningScore: null,
          readingScore: null,
          writingScore: null,
          speakingScore: speakingScore,
          feedback: aiResponse.feedback as any,
          gradedAt: new Date(),
        };

        resultRecord = await this.prisma.result.upsert({
          where: { sessionId: session.id },
          update: resultData,
          create: resultData,
        });

        status = 'COMPLETED';
        graded = true;
      } catch (err: any) {
        console.error('[Speaking] Synchronous grading failed:', err.message);
        if (err.status === 503 || err.status === 429) {
          throw new ServiceUnavailableException(err.message);
        }
        throw new BadRequestException('Speaking grading failed: ' + err.message);
      }
    }

    const updatedSession = await this.prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status,
      },
      include: { result: true },
    });

    return updatedSession;
  }

  private async triggerWritingGrader(
    sessionId: string,
    answers: Record<string, any>,
    questions: any,
  ): Promise<any> {
    const tasks = (questions?.tasks as any[]) || [];
    const task1 = tasks.find((t: any) => t.task_number === 1);
    const task2 = tasks.find((t: any) => t.task_number === 2);

    const backendAiUrl = process.env.BACKEND_AI_URL || 'http://localhost:8000';
    const payload = {
      session_id: sessionId,
      task1_prompt: task1?.prompt || '',
      task2_prompt: task2?.prompt || '',
      task1_image_url: task1?.image_url || '',
      task1_essay: answers?.task1 || '',
      task2_essay: answers?.task2 || '',
    };

    const res = await fetch(`${backendAiUrl}/api/v1/writing/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorDetail = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.detail) errorDetail = parsed.detail;
      } catch (e) {
        // ignore JSON parse error
      }
      const error = new Error(errorDetail);
      (error as any).status = res.status;
      throw error;
    }
    return res.json();
  }

  private async triggerSpeakingGrader(
    sessionId: string,
    answers: Record<string, any>,
    questions: any,
  ): Promise<any> {
    const backendAiUrl = process.env.BACKEND_AI_URL || 'http://localhost:8000';
    const payload = {
      session_id: sessionId,
      exam_questions: questions,
      audio_answers: answers,
    };

    const res = await fetch(`${backendAiUrl}/api/v1/speaking/grade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorDetail = errorText;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.detail) errorDetail = parsed.detail;
      } catch (e) {
        // ignore
      }
      const error = new Error(errorDetail);
      (error as any).status = res.status;
      throw error;
    }
    return res.json();
  }

  async getSession(sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            duration: true,
            type: true,
            questions: true,
          },
        },
        result: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!session) {
      throw new BadRequestException('Session not found.');
    }

    return session;
  }

  async deleteSession(sessionId: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) {
      throw new BadRequestException('Session not found.');
    }

    // Delete associated result first (if any)
    await this.prisma.result.deleteMany({
      where: { sessionId },
    });

    // Delete the session
    await this.prisma.examSession.delete({
      where: { id: sessionId },
    });

    return { success: true };
  }
}
