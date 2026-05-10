import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { StreakService } from "./streak.service";
import { NotificationsService } from "../notifications/notifications.service";
import { GamificationService } from "../gamification/gamification.service";

@Injectable()
export class IeltsService {
  private readonly logger = new Logger(IeltsService.name);

  constructor(
    private prisma: PrismaService,
    private streakService: StreakService,
    private notifications: NotificationsService,
    private gamificationService: GamificationService,
  ) {}

  async findAllSkills() {
    return this.prisma.ieltsBasicSkill.findMany({
      orderBy: { order: "asc" },
    });
  }

  async findLessonsBySkill(skillName: string) {
    const skill = await this.prisma.ieltsBasicSkill.findUnique({
      where: { name: skillName },
    });

    if (!skill) {
      throw new NotFoundException(`Skill ${skillName} not found`);
    }

    return this.prisma.ieltsBasicLesson.findMany({
      where: { skillId: skill.id },
      orderBy: { order: "asc" },
    });
  }

  async findLessonById(lessonId: string) {
    const foundationVocabLesson = await this.prisma.ieltsBasicLesson.findUnique({
      where: { id: lessonId },
      include: { skill: { select: { name: true } } },
    });

    if (!foundationVocabLesson) {
      throw new NotFoundException(`FoundationVocabLesson with ID ${lessonId} not found`);
    }

    return foundationVocabLesson;
  }

  // ── Listening ──────────────────────────────────────────────────────────

  async findListeningExercisesByLesson(lessonId: string) {
    return this.prisma.ieltsBasicListeningExercise.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
      select: { id: true, topic: true, order: true },
    });
  }

  async findListeningExerciseById(exerciseId: string) {
    const exercise = await this.prisma.ieltsBasicListeningExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(
        `Listening exercise with ID ${exerciseId} not found`,
      );
    }

    return exercise;
  }

  // ── Reading ────────────────────────────────────────────────────────────

  async findReadingExercisesByLesson(lessonId: string) {
    return this.prisma.ieltsBasicReadingExercise.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
      select: { id: true, topic: true, order: true },
    });
  }

  async findReadingExerciseById(exerciseId: string) {
    const exercise = await this.prisma.ieltsBasicReadingExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(
        `Reading exercise with ID ${exerciseId} not found`,
      );
    }

    return exercise;
  }

  // ── Writing ────────────────────────────────────────────────────────────

  async findWritingExercisesByLesson(lessonId: string) {
    return this.prisma.ieltsBasicWritingExercise.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
      select: { id: true, topic: true, order: true, taskType: true },
    });
  }

  async findWritingExerciseById(exerciseId: string) {
    const exercise = await this.prisma.ieltsBasicWritingExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(
        `Writing exercise with ID ${exerciseId} not found`,
      );
    }

    return exercise;
  }

  // ── Progress Tracking ──────────────────────────────────────────────────

  async getUserProgress(userId: string) {
    return this.prisma.ieltsBasicProgress.findMany({
      where: { userId },
      select: {
        id: true,
        lessonId: true,
        listeningExerciseId: true,
        readingExerciseId: true,
        writingExerciseId: true,
        isCompleted: true,
      },
    });
  }

  async markItemCompleted(
    userId: string,
    data: {
      lessonId?: string;
      listeningExerciseId?: string;
      readingExerciseId?: string;
      writingExerciseId?: string;
      speakingExerciseId?: string;
    },
  ) {
    // Upsert to mark as completed.
    // Since prisma requires unique constraint for upsert, and our unique constraint is on multiple nullable columns,
    // we should use findFirst + create/update to be safe.

    const existing = await this.prisma.ieltsBasicProgress.findFirst({
      where: {
        userId,
        lessonId: data.lessonId || null,
        listeningExerciseId: data.listeningExerciseId || null,
        readingExerciseId: data.readingExerciseId || null,
        writingExerciseId: data.writingExerciseId || null,
        speakingExerciseId: data.speakingExerciseId || null,
      },
    });

    if (existing) {
      const updated = await this.prisma.ieltsBasicProgress.update({
        where: { id: existing.id },
        data: { isCompleted: true },
      });
      await this.streakService.recordActivity(userId);
      
      const progress = updated;
      if (progress.isCompleted) {
        if (progress.lessonId) {
          this.gamificationService
            .onEvent(userId, {
              xp: 10,
              reason: "IELTS_BASIC_LESSON",
              achievementKeys: ["IB_LESSON_5"],
            })
            .catch(() => {});
        } else if (progress.listeningExerciseId || progress.readingExerciseId || progress.writingExerciseId || progress.speakingExerciseId) {
          this.gamificationService
            .onEvent(userId, {
              xp: 15,
              reason: "IELTS_BASIC_EXERCISE",
              achievementKeys: [
                ...(progress.listeningExerciseId ? ["IB_LISTENING_3"] : []),
                ...(progress.readingExerciseId ? ["IB_READING_3"] : []),
                ...(progress.writingExerciseId ? ["IB_WRITING_3"] : []),
                ...(progress.speakingExerciseId ? ["IB_SPEAKING_3"] : []),
              ],
            })
            .catch(() => {});
        }
      }

      return updated;
    }

    const created = await this.prisma.ieltsBasicProgress.create({
      data: {
        userId,
        lessonId: data.lessonId,
        listeningExerciseId: data.listeningExerciseId,
        readingExerciseId: data.readingExerciseId,
        writingExerciseId: data.writingExerciseId,
        speakingExerciseId: data.speakingExerciseId,
        isCompleted: true,
      },
    });

    await this.streakService.recordActivity(userId);

    const progress = created;

    if (progress.isCompleted) {
      if (progress.lessonId) {
        this.gamificationService
          .onEvent(userId, {
            xp: 10,
            reason: "IELTS_BASIC_LESSON",
            achievementKeys: ["IB_LESSON_5"],
          })
          .catch(() => {});
      } else if (progress.listeningExerciseId || progress.readingExerciseId || progress.writingExerciseId || progress.speakingExerciseId) {
        this.gamificationService
          .onEvent(userId, {
            xp: 15,
            reason: "IELTS_BASIC_EXERCISE",
            achievementKeys: [
              ...(progress.listeningExerciseId ? ["IB_LISTENING_3"] : []),
              ...(progress.readingExerciseId ? ["IB_READING_3"] : []),
              ...(progress.writingExerciseId ? ["IB_WRITING_3"] : []),
              ...(progress.speakingExerciseId ? ["IB_SPEAKING_3"] : []),
            ],
          })
          .catch(() => {});
      }
    }

    return created;
  }

  async getLibraryStats(userId: string) {
    const skills = await this.prisma.ieltsBasicSkill.findMany({
      orderBy: { order: "asc" },
    });
    const ieltsIntensiveResult = [];

    for (const skill of skills) {
      const lessons = await this.prisma.ieltsBasicLesson.findMany({
        where: { skillId: skill.id },
        select: { id: true },
      });
      const listeningEx = await this.prisma.ieltsBasicListeningExercise.findMany({
        where: { skillId: skill.id },
        select: { id: true },
      });
      const readingEx = await this.prisma.ieltsBasicReadingExercise.findMany({
        where: { skillId: skill.id },
        select: { id: true },
      });
      const writingEx = await this.prisma.ieltsBasicWritingExercise.findMany({
        where: { skillId: skill.id },
        select: { id: true },
      });
      const speakingEx = await this.prisma.ieltsBasicSpeakingExercise.findMany({
        where: { skillId: skill.id },
        select: { id: true },
      });

      const lessonIds = lessons.map((l) => l.id);
      const listeningExIds = listeningEx.map((l) => l.id);
      const readingExIds = readingEx.map((l) => l.id);
      const writingExIds = writingEx.map((l) => l.id);
      const speakingExIds = speakingEx.map((l) => l.id);

      const completedLessons = await this.prisma.ieltsBasicProgress.count({
        where: {
          userId,
          isCompleted: true,
          lessonId: { in: lessonIds.length ? lessonIds : ["dummy"] },
        },
      });
      const completedListeningEx = await this.prisma.ieltsBasicProgress.count({
        where: {
          userId,
          isCompleted: true,
          listeningExerciseId: {
            in: listeningExIds.length ? listeningExIds : ["dummy"],
          },
        },
      });
      const completedReadingEx = await this.prisma.ieltsBasicProgress.count({
        where: {
          userId,
          isCompleted: true,
          readingExerciseId: {
            in: readingExIds.length ? readingExIds : ["dummy"],
          },
        },
      });
      const completedWritingEx = await this.prisma.ieltsBasicProgress.count({
        where: {
          userId,
          isCompleted: true,
          writingExerciseId: {
            in: writingExIds.length ? writingExIds : ["dummy"],
          },
        },
      });
      const completedSpeakingEx = await this.prisma.ieltsBasicProgress.count({
        where: {
          userId,
          isCompleted: true,
          speakingExerciseId: {
            in: speakingExIds.length ? speakingExIds : ["dummy"],
          },
        },
      });

      // Prevent Prisma `in: []` error by conditionally checking or using length
      const actualCompletedLessons =
        lessonIds.length > 0 ? completedLessons : 0;
      const actualCompletedListEx =
        listeningExIds.length > 0 ? completedListeningEx : 0;
      const actualCompletedReadEx =
        readingExIds.length > 0 ? completedReadingEx : 0;
      const actualCompletedWriteEx =
        writingExIds.length > 0 ? completedWritingEx : 0;
      const actualCompletedSpeakEx =
        speakingExIds.length > 0 ? completedSpeakingEx : 0;

      ieltsIntensiveResult.push({
        id: skill.id,
        skill: skill.name,
        lessons: {
          total: lessons.length,
          completed: actualCompletedLessons,
        },
        exercises: {
          total:
            listeningEx.length + readingEx.length + writingEx.length + speakingEx.length,
          completed:
            actualCompletedListEx +
            actualCompletedReadEx +
            actualCompletedWriteEx +
            actualCompletedSpeakEx,
        },
      });
    }

    return ieltsIntensiveResult;
  }

  async resetProgress(userId: string) {
    return this.prisma.ieltsBasicProgress.deleteMany({
      where: { userId },
    });
  }

  // ── Exercise Snippet ───────────────────────────────────────────────────

  async findExerciseSnippet(type: string, id: string, groupIndex: number) {
    let exercise: any;

    if (type === "listening") {
      exercise = await this.prisma.ieltsBasicListeningExercise.findUnique({
        where: { id },
        select: { id: true, topic: true, instructions: true, content: true },
      });
    } else if (type === "reading") {
      exercise = await this.prisma.ieltsBasicReadingExercise.findUnique({
        where: { id },
        select: { id: true, topic: true, instructions: true, content: true },
      });
    } else if (type === "writing") {
      exercise = await this.prisma.ieltsBasicWritingExercise.findUnique({
        where: { id },
        select: {
          id: true,
          topic: true,
          instructions: true,
          modelAnswer: true,
          diagramUrl: true,
          prompt: true,
          taskType: true,
        },
      });
    } else {
      throw new NotFoundException(`Unknown exercise type: ${type}`);
    }

    if (!exercise) {
      throw new NotFoundException(`Exercise ${id} not found`);
    }

    const content = exercise.content as any[];
    const group = content?.[groupIndex];

    if (!group) {
      throw new NotFoundException(
        `Group index ${groupIndex} not found in exercise ${id}`,
      );
    }

    return {
      exerciseId: exercise.id,
      topic: exercise.topic,
      instructions: exercise.instructions,
      group,
      groupIndex,
      exerciseType: type,
    };
  }
  async saveWritingUserAnswer(
    userId: string,
    exerciseId: string,
    answers: Record<string, string>,
  ) {
    const exercise = await this.prisma.ieltsBasicWritingExercise.findUnique({
      where: { id: exerciseId }
    });
    
    let score = 0;
    let totalBlanks = 0;
    
    if (exercise && exercise.modelAnswer) {
      const modelAnswer = exercise.modelAnswer as any;
      if (modelAnswer.paragraphs) {
        for (const paragraph of modelAnswer.paragraphs) {
          for (const segment of paragraph.segments) {
            if (segment.type === 'blank') {
              totalBlanks++;
              if (answers[segment.id] === segment.correctAnswer) {
                score++;
              }
            }
          }
        }
      }
    }

    return this.prisma.ieltsBasicWritingAnswer.upsert({
      where: {
        userId_writingExerciseId: {
          userId,
          writingExerciseId: exerciseId,
        },
      },
      update: {
        answers,
        score,
        totalBlanks,
      },
      create: {
        userId,
        writingExerciseId: exerciseId,
        answers,
        score,
        totalBlanks,
      },
    });
  }

  async getWritingUserAnswer(userId: string, exerciseId: string) {
    return this.prisma.ieltsBasicWritingAnswer.findUnique({
      where: {
        userId_writingExerciseId: {
          userId,
          writingExerciseId: exerciseId,
        },
      },
    });
  }

  // ── Placement Test ──────────────────────────────────────────────────────

  async getPlacementExercises() {
    const listening = await this.prisma.ieltsBasicListeningExercise.findFirst({
      orderBy: { order: "asc" },
    });
    const reading = await this.prisma.ieltsBasicReadingExercise.findFirst({
      orderBy: { order: "asc" },
    });
    return { listening, reading, writing: null };
  }
  // ── Speaking ──────────────────────────────────────────────────────────

  async findSpeakingExercisesByLesson(lessonId: string) {
    return this.prisma.ieltsBasicSpeakingExercise.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
      select: { id: true, topic: true, order: true, partType: true, questionType: true },
    });
  }

  async findSpeakingExerciseById(exerciseId: string) {
    const exercise = await this.prisma.ieltsBasicSpeakingExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(
        `Speaking exercise with ID ${exerciseId} not found`,
      );
    }

    return exercise;
  }
}
