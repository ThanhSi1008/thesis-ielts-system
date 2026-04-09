import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class IeltsService {
  private readonly logger = new Logger(IeltsService.name);

  constructor(private prisma: PrismaService) {}

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
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return lesson;
  }

  async findExercisesByLesson(lessonId: string) {
    return this.prisma.ieltsExercise.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        topic: true,
        order: true,
      }
    });
  }

  async findExerciseById(exerciseId: string) {
    const exercise = await this.prisma.ieltsExercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
    }

    return exercise;
  }
}
