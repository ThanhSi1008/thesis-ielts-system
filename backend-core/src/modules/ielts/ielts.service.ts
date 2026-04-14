import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class IeltsService {
  private readonly logger = new Logger(IeltsService.name);

  constructor(private prisma: PrismaService) { }

  async findAllSkills() {
    return this.prisma.ieltsSkill.findMany({
      orderBy: { order: "asc" },
    });
  }

  async findLessonsBySkill(skillName: string) {
    const skill = await this.prisma.ieltsSkill.findUnique({
      where: { name: skillName },
    });

    if (!skill) {
      throw new NotFoundException(`Skill ${skillName} not found`);
    }

    return this.prisma.ieltsLesson.findMany({
      where: { skillId: skill.id },
      orderBy: { order: "asc" },
    });
  }

  async findLessonById(lessonId: string) {
    const lesson = await this.prisma.ieltsLesson.findUnique({
      where: { id: lessonId },
      include: { skill: { select: { name: true } } },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return lesson;
  }

  // ── Listening ──────────────────────────────────────────────────────────

  async findListeningExercisesByLesson(lessonId: string) {
    return this.prisma.ieltsListeningExercise.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
      select: { id: true, topic: true, order: true },
    });
  }

  async findListeningExerciseById(exerciseId: string) {
    const exercise = await this.prisma.ieltsListeningExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(
        `Listening exercise with ID ${exerciseId} not found`
      );
    }

    return exercise;
  }

  // ── Reading ────────────────────────────────────────────────────────────

  async findReadingExercisesByLesson(lessonId: string) {
    return this.prisma.ieltsReadingExercise.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
      select: { id: true, topic: true, order: true },
    });
  }

  async findReadingExerciseById(exerciseId: string) {
    const exercise = await this.prisma.ieltsReadingExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(
        `Reading exercise with ID ${exerciseId} not found`
      );
    }

    return exercise;
  }

  // ── Writing ────────────────────────────────────────────────────────────

  async findWritingExercisesByLesson(lessonId: string) {
    return this.prisma.ieltsWritingExercise.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
      select: { id: true, topic: true, order: true },
    });
  }

  async findWritingExerciseById(exerciseId: string) {
    const exercise = await this.prisma.ieltsWritingExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(
        `Writing exercise with ID ${exerciseId} not found`
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
    }
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
      },
    });

    if (existing) {
      return this.prisma.ieltsBasicProgress.update({
        where: { id: existing.id },
        data: { isCompleted: true },
      });
    }

    return this.prisma.ieltsBasicProgress.create({
      data: {
        userId,
        lessonId: data.lessonId,
        listeningExerciseId: data.listeningExerciseId,
        readingExerciseId: data.readingExerciseId,
        writingExerciseId: data.writingExerciseId,
        isCompleted: true,
      },
    });
  }

  async getLibraryStats(userId: string) {
    const skills = await this.prisma.ieltsSkill.findMany({
      orderBy: { order: "asc" },
    });
    const result = [];

    for (const skill of skills) {
      const lessons = await this.prisma.ieltsLesson.findMany({
        where: { skillId: skill.id }, select: { id: true }
      });
      const listeningEx = await this.prisma.ieltsListeningExercise.findMany({
        where: { skillId: skill.id }, select: { id: true }
      });
      const readingEx = await this.prisma.ieltsReadingExercise.findMany({
        where: { skillId: skill.id }, select: { id: true }
      });
      const writingEx = await this.prisma.ieltsWritingExercise.findMany({
        where: { skillId: skill.id }, select: { id: true }
      });

      const lessonIds = lessons.map(l => l.id);
      const listeningExIds = listeningEx.map(l => l.id);
      const readingExIds = readingEx.map(l => l.id);
      const writingExIds = writingEx.map(l => l.id);

      const completedLessons = await this.prisma.ieltsBasicProgress.count({
        where: { userId, isCompleted: true, lessonId: { in: lessonIds.length ? lessonIds : ['dummy'] } }
      });
      const completedListeningEx = await this.prisma.ieltsBasicProgress.count({
        where: { userId, isCompleted: true, listeningExerciseId: { in: listeningExIds.length ? listeningExIds : ['dummy'] } }
      });
      const completedReadingEx = await this.prisma.ieltsBasicProgress.count({
        where: { userId, isCompleted: true, readingExerciseId: { in: readingExIds.length ? readingExIds : ['dummy'] } }
      });
      const completedWritingEx = await this.prisma.ieltsBasicProgress.count({
        where: { userId, isCompleted: true, writingExerciseId: { in: writingExIds.length ? writingExIds : ['dummy'] } }
      });

      // Prevent Prisma `in: []` error by conditionally checking or using length
      const actualCompletedLessons = lessonIds.length > 0 ? completedLessons : 0;
      const actualCompletedListEx = listeningExIds.length > 0 ? completedListeningEx : 0;
      const actualCompletedReadEx = readingExIds.length > 0 ? completedReadingEx : 0;
      const actualCompletedWriteEx = writingExIds.length > 0 ? completedWritingEx : 0;

      result.push({
        id: skill.id,
        skill: skill.name,
        lessons: {
          total: lessons.length,
          completed: actualCompletedLessons
        },
        exercises: {
          total: listeningEx.length + readingEx.length + writingEx.length,
          completed: actualCompletedListEx + actualCompletedReadEx + actualCompletedWriteEx
        }
      });
    }

    return result;
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
      exercise = await this.prisma.ieltsListeningExercise.findUnique({
        where: { id },
        select: { id: true, topic: true, instructions: true, content: true },
      });
    } else if (type === "reading") {
      exercise = await this.prisma.ieltsReadingExercise.findUnique({
        where: { id },
        select: { id: true, topic: true, instructions: true, content: true },
      });
    } else if (type === "writing") {
      exercise = await this.prisma.ieltsWritingExercise.findUnique({
        where: { id },
        select: { id: true, topic: true, instructions: true, modelAnswer: true, diagramUrl: true, prompt: true },
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
        `Group index ${groupIndex} not found in exercise ${id}`
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
}
