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

  async generateRoadmap(userId: string): Promise<{ steps: RoadmapStep[]; currentStep: number }> {
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
    let maxQueueLength = 0;

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
      if (q.length > maxQueueLength) {
        maxQueueLength = q.length;
      }
    }

    // Zip into steps
    const steps: RoadmapStep[] = [];
    let currentStep = 1;

    for (let i = 0; i < maxQueueLength; i++) {
      const stepItems: RoadmapItem[] = [];

      for (const skillName of Object.keys(queues)) {
        if (i < queues[skillName].length) {
          stepItems.push(queues[skillName][i]);
        }
      }

      steps.push({
        step: i + 1,
        items: stepItems,
        isLocked: false,
        isCompleted: false,
      });
    }

    // Apply sequential step-level locking:
    // A step is unlocked only when the previous step is fully completed.
    // Within an unlocked step, items unlock one-at-a-time sequentially.
    let previousStepCompleted = true; // Step 1 is always unlocked

    for (const step of steps) {
      if (!previousStepCompleted) {
        // This whole step is locked
        step.isLocked = true;
        step.isCompleted = false;
        step.items.forEach((item) => (item.isLocked = true));
        continue;
      }

      // Step is reachable — unlock items one-at-a-time within the step
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
    // If all are completed, default to the last step.
    const activeStep = steps.find((s) => s.items.some((item) => !item.isLocked && !item.isCompleted));
    currentStep = activeStep ? activeStep.step : (steps.length > 0 ? steps[steps.length - 1].step : 1);

    return { steps, currentStep };
  }
}
