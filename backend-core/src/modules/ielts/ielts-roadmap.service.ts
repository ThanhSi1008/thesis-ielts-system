import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface RoadmapItem {
  id: string;
  title: string;
  type: 'lesson' | 'exercise';
  skill: string;
  url: string;
  isCompleted: boolean;
  isLocked?: boolean;
  lessonId?: string;
}

export interface RoadmapStep {
  step: number;
  items: RoadmapItem[];
  isLocked: boolean;
  isCompleted: boolean;
}

@Injectable()
export class IeltsRoadmapService {
  constructor(private prisma: PrismaService) { }

  async generateRoadmap(userId: string): Promise<{ steps: RoadmapStep[]; currentStep: number; requiresOnboarding?: boolean }> {
    const profile = await this.prisma.ieltsProfile.findUnique({
      where: { userId },
    });

    if (!profile || !profile.onboardingCompleted) {
      return { steps: [], currentStep: 1, requiresOnboarding: true };
    }

    const skills = await this.prisma.ieltsSkill.findMany({
      orderBy: { order: 'asc' },
    });

    const progressRecords = await this.prisma.ieltsBasicProgress.findMany({
      where: { userId },
    });

    // Quick lookup for completions
    const isCompleted = (type: 'lesson' | 'listeningExercise' | 'readingExercise', id: string) => {
      return progressRecords.some((p) => {
        if (type === 'lesson') return p.lessonId === id && p.isCompleted;
        if (type === 'listeningExercise') return p.listeningExerciseId === id && p.isCompleted;
        if (type === 'readingExercise') return p.readingExerciseId === id && p.isCompleted;
        return false;
      });
    };

    // Queues of items for each skill
    const queues: Record<string, RoadmapItem[]> = {};

    for (const skill of skills) {
      const q: RoadmapItem[] = [];

      const lessons = await this.prisma.ieltsLesson.findMany({
        where: { skillId: skill.id },
        orderBy: { order: 'asc' },
      });

      for (const lesson of lessons) {
        // Push the lesson itself
        q.push({
          id: lesson.id,
          title: lesson.title,
          type: 'lesson',
          skill: skill.name,
          url: `/ielts/basic/${skill.name.toLowerCase()}/lessons/${lesson.id}`,
          isCompleted: isCompleted('lesson', lesson.id),
        });

        // Push associated exercises
        if (skill.name === 'Listening') {
          const exercises = await this.prisma.ieltsListeningExercise.findMany({
            where: { lessonId: lesson.id },
            orderBy: { order: 'asc' },
          });
          exercises.forEach((ex) => {
            q.push({
              id: ex.id,
              title: ex.topic,
              type: 'exercise',
              skill: skill.name,
              url: `/ielts/basic/${skill.name.toLowerCase()}/exercises/${ex.id}?lessonId=${lesson.id}`,
              isCompleted: isCompleted('listeningExercise', ex.id),
              lessonId: lesson.id,
            });
          });
        } else if (skill.name === 'Reading') {
          const exercises = await this.prisma.ieltsReadingExercise.findMany({
            where: { lessonId: lesson.id },
            orderBy: { order: 'asc' },
          });
          exercises.forEach((ex) => {
            q.push({
              id: ex.id,
              title: ex.topic,
              type: 'exercise',
              skill: skill.name,
              url: `/ielts/basic/${skill.name.toLowerCase()}/exercises/${ex.id}?lessonId=${lesson.id}`,
              isCompleted: isCompleted('readingExercise', ex.id),
              lessonId: lesson.id,
            });
          });
        }
      }

      queues[skill.name] = q;
    }

    const dailyMinutes = profile.dailyCommitmentMins || 30;
    const steps: RoadmapStep[] = [];
    let currentStepNum = 1;

    // Flatten all queues into a single linear queue, taking one from each skill in turn
    const flattenedQueue: RoadmapItem[] = [];
    let hasMore = true;
    let i = 0;
    while (hasMore) {
      hasMore = false;
      for (const skillName of Object.keys(queues)) {
        if (i < queues[skillName].length) {
          flattenedQueue.push(queues[skillName][i]);
          hasMore = true;
        }
      }
      i++;
    }

    // Now chunk the flattenedQueue by time
    let currentStepItems: RoadmapItem[] = [];
    let currentStepMins = 0;

    for (const item of flattenedQueue) {
      const itemMins = item.type === 'lesson' ? 10 : 15;

      if (currentStepItems.length > 0 && currentStepMins + itemMins > dailyMinutes) {
        // Step is full, push it and start a new one
        steps.push({
          step: currentStepNum++,
          items: currentStepItems,
          isLocked: false,
          isCompleted: false,
        });
        currentStepItems = [item];
        currentStepMins = itemMins;
      } else {
        // Add to current step
        currentStepItems.push(item);
        currentStepMins += itemMins;
      }
    }

    if (currentStepItems.length > 0) {
      steps.push({
        step: currentStepNum++,
        items: currentStepItems,
        isLocked: false,
        isCompleted: false,
      });
    }

    // Apply sequential step-level locking:
    let previousStepCompleted = true; // Step 1 is always unlocked

    for (const step of steps) {
      if (!previousStepCompleted) {
        step.isLocked = true;
        step.isCompleted = false;
        step.items.forEach((item) => (item.isLocked = true));
        continue;
      }

      step.isLocked = false;
      let stepFullyCompleted = true;
      let foundIncomplete = false;

      for (const item of step.items) {
        if (foundIncomplete) {
          item.isLocked = true;
          stepFullyCompleted = false;
        } else {
          item.isLocked = false;
          if (!item.isCompleted) {
            foundIncomplete = true;
            stepFullyCompleted = false;
          }
        }
      }

      step.isCompleted = stepFullyCompleted;
      previousStepCompleted = stepFullyCompleted;
    }

    // Current step is the first step containing an unlocked, incomplete item.
    const activeStep = steps.find((s) => s.items.some((item) => !item.isLocked && !item.isCompleted));
    let currentStep = activeStep ? activeStep.step : (steps.length > 0 ? steps[steps.length - 1].step : 1);

    return { steps, currentStep };
  }

  async processOnboarding(
    userId: string,
    data: { targetBand: number; dailyCommitmentMins: number; takePlacement: boolean; placementScore?: number }
  ) {
    await this.prisma.ieltsProfile.upsert({
      where: { userId },
      update: {
        targetBand: data.targetBand,
        dailyCommitmentMins: data.dailyCommitmentMins,
        placementScore: data.placementScore,
        onboardingCompleted: true,
      },
      create: {
        userId,
        targetBand: data.targetBand,
        dailyCommitmentMins: data.dailyCommitmentMins,
        placementScore: data.placementScore,
        onboardingCompleted: true,
      },
    });

    if (data.takePlacement && data.placementScore && data.placementScore > 80) {
      // Find the first few lessons and mark them completed
      const basicLessons = await this.prisma.ieltsLesson.findMany({
        orderBy: { order: 'asc' },
        take: 3, // Completing first 3 basic lessons
      });

      for (const lesson of basicLessons) {
        let existing = await this.prisma.ieltsBasicProgress.findFirst({
          where: { userId, lessonId: lesson.id }
        });
        if (existing) {
          await this.prisma.ieltsBasicProgress.update({ where: { id: existing.id }, data: { isCompleted: true } });
        } else {
          await this.prisma.ieltsBasicProgress.create({ data: { userId, lessonId: lesson.id, isCompleted: true } });
        }

        const listeningExercises = await this.prisma.ieltsListeningExercise.findMany({
          where: { lessonId: lesson.id },
        });
        for (const ex of listeningExercises) {
          let existingEx = await this.prisma.ieltsBasicProgress.findFirst({
            where: { userId, listeningExerciseId: ex.id }
          });
          if (existingEx) {
            await this.prisma.ieltsBasicProgress.update({ where: { id: existingEx.id }, data: { isCompleted: true } });
          } else {
            await this.prisma.ieltsBasicProgress.create({ data: { userId, listeningExerciseId: ex.id, isCompleted: true } });
          }
        }
        
        const readingExercises = await this.prisma.ieltsReadingExercise.findMany({
          where: { lessonId: lesson.id },
        });
        for (const ex of readingExercises) {
          let existingEx = await this.prisma.ieltsBasicProgress.findFirst({
            where: { userId, readingExerciseId: ex.id }
          });
          if (existingEx) {
            await this.prisma.ieltsBasicProgress.update({ where: { id: existingEx.id }, data: { isCompleted: true } });
          } else {
            await this.prisma.ieltsBasicProgress.create({ data: { userId, readingExerciseId: ex.id, isCompleted: true } });
          }
        }
      }
    }

    return { success: true };
  }
}
