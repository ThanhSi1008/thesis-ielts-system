import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreateLessonDto } from "./dto/create-foundationVocabLesson.dto";
import { CreateVocabularyDto } from "./dto/create-foundationVocabWord.dto";
import { CreateGrammarDto } from "./dto/create-grammar.dto";
import { UpdateProgressDto } from "./dto/update-progress.dto";
import { FoundationVocabWord } from "@prisma/client";

/**
 * Learning Service
 * Handles business logic for learning materials, lessons, foundationVocabWord, and grammar
 */
@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(private prisma: PrismaService) {}

  // ==================== EXISTING METHODS ====================

  async findAllMaterials() {
    return this.prisma.learningMaterial.findMany({
      where: { isPublished: true },
    });
  }

  async findOneMaterial(id: string) {
    return this.prisma.learningMaterial.findUnique({
      where: { id },
    });
  }

  async findUserProgress(userId: string) {
    return this.prisma.learningProgress.findMany({
      where: { userId },
      include: {
        material: true,
      },
    });
  }

  async updateProgress(updateProgressDto: UpdateProgressDto) {
    const { userId, materialId, progress, completed } = updateProgressDto;

    return this.prisma.learningProgress.upsert({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
      update: {
        progress,
        completed,
        lastAccess: new Date(),
      },
      create: {
        userId,
        materialId,
        progress,
        completed,
      },
    });
  }

  // ==================== LESSON METHODS ====================

  /**
   * Create a new foundationVocabLesson
   * @param createLessonDto - Lesson data
   * @returns Created foundationVocabLesson
   */
  async createLesson(createLessonDto: CreateLessonDto) {
    try {
      const foundationVocabLesson = await this.prisma.foundationVocabLesson.create({
        data: {
          title: createLessonDto.title,
          description: createLessonDto.description,
          difficulty: createLessonDto.difficulty,
          order: createLessonDto.order,
          isPublished: createLessonDto.isPublished ?? false,
        },
      });

      this.logger.log(`✅ FoundationVocabLesson created: ${foundationVocabLesson.id}`);
      return foundationVocabLesson;
    } catch (error) {
      this.logger.error(`❌ Failed to create foundationVocabLesson: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all lessons with optional filtering
   * @param filters - Optional filters (difficulty, isPublished)
   * @returns List of lessons
   */
  async findAllLessons(filters?: {
    difficulty?: string;
    isPublished?: boolean;
  }) {
    try {
      const where: any = {};

      if (filters?.difficulty) {
        where.difficulty = filters.difficulty;
      }

      if (filters?.isPublished !== undefined) {
        where.isPublished = filters.isPublished;
      }

      const lessons = await this.prisma.foundationVocabLesson.findMany({
        where,
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: {
              vocabularies: true,
              grammars: true,
            },
          },
        },
      });

      return lessons;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch lessons: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find a foundationVocabLesson by ID with all foundationVocabWord and grammar items
   * @param id - Lesson ID
   * @returns FoundationVocabLesson with foundationVocabWord and grammar
   */
  async findLessonById(id: string) {
    try {
      const foundationVocabLesson = await this.prisma.foundationVocabLesson.findUnique({
        where: { id },
        include: {
          vocabularies: {
            orderBy: { createdAt: "asc" },
          },
          grammars: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!foundationVocabLesson) {
        throw new NotFoundException(`FoundationVocabLesson with ID ${id} not found`);
      }

      return foundationVocabLesson;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch foundationVocabLesson: ${error.message}`);
      throw error;
    }
  }

  // ==================== VOCABULARY METHODS ====================

  /**
   * Get foundationVocabWord by ID
   * @param id - FoundationVocabWord ID
   * @returns FoundationVocabWord or null
   */
  async getVocabularyById(id: string): Promise<FoundationVocabWord | null> {
    return this.prisma.foundationVocabWord.findUnique({
      where: { id },
    });
  }

  /**
   * Create a foundationVocabWord item
   * @param createVocabularyDto - FoundationVocabWord data
   * @returns Created foundationVocabWord
   */
  async createVocabulary(createVocabularyDto: CreateVocabularyDto) {
    try {
      // Verify foundationVocabLesson exists
      const foundationVocabLesson = await this.prisma.foundationVocabLesson.findUnique({
        where: { id: createVocabularyDto.lessonId },
      });

      if (!foundationVocabLesson) {
        throw new NotFoundException(
          `FoundationVocabLesson with ID ${createVocabularyDto.lessonId} not found`,
        );
      }

      const foundationVocabWord = await this.prisma.foundationVocabWord.create({
        data: {
          lessonId: createVocabularyDto.lessonId,
          word: createVocabularyDto.word,
          meaning: createVocabularyDto.meaning,
          ipa: createVocabularyDto.ipa,
          audioUrl: createVocabularyDto.audioUrl,
          example: createVocabularyDto.example,
          partOfSpeech: createVocabularyDto.partOfSpeech,
        },
      });

      this.logger.log(
        `✅ FoundationVocabWord created: ${foundationVocabWord.id} - ${foundationVocabWord.word}`,
      );
      return foundationVocabWord;
    } catch (error) {
      this.logger.error(`❌ Failed to create foundationVocabWord: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all foundationVocabWord items for a foundationVocabLesson
   * @param lessonId - Lesson ID
   * @returns List of foundationVocabWord items
   */
  async findVocabularyByLesson(lessonId: string) {
    try {
      const vocabularies = await this.prisma.foundationVocabWord.findMany({
        where: { lessonId },
        orderBy: { createdAt: "asc" },
      });

      return vocabularies;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch foundationVocabWord: ${error.message}`);
      throw error;
    }
  }

  // ==================== GRAMMAR METHODS ====================

  /**
   * Create a grammar item
   * @param createGrammarDto - Grammar data
   * @returns Created grammar
   */
  async createGrammar(createGrammarDto: CreateGrammarDto) {
    try {
      // Verify foundationVocabLesson exists
      const foundationVocabLesson = await this.prisma.foundationVocabLesson.findUnique({
        where: { id: createGrammarDto.lessonId },
      });

      if (!foundationVocabLesson) {
        throw new NotFoundException(
          `FoundationVocabLesson with ID ${createGrammarDto.lessonId} not found`,
        );
      }

      const grammar = await this.prisma.grammar.create({
        data: {
          lessonId: createGrammarDto.lessonId,
          title: createGrammarDto.title,
          rule: createGrammarDto.rule,
          example: createGrammarDto.example,
        },
      });

      this.logger.log(`✅ Grammar created: ${grammar.id} - ${grammar.title}`);
      return grammar;
    } catch (error) {
      this.logger.error(`❌ Failed to create grammar: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all grammar items for a foundationVocabLesson
   * @param lessonId - Lesson ID
   * @returns List of grammar items
   */
  async findGrammarByLesson(lessonId: string) {
    try {
      const grammars = await this.prisma.grammar.findMany({
        where: { lessonId },
        orderBy: { createdAt: "asc" },
      });

      return grammars;
    } catch (error) {
      this.logger.error(`❌ Failed to fetch grammar: ${error.message}`);
      throw error;
    }
  }

  // ==================== PRONUNCIATION METHODS ====================

  /**
   * Create a pronunciation attempt record
   * @param data - Pronunciation attempt data
   * @returns Created pronunciation attempt
   */
  async createPronunciationAttempt(data: {
    userId: string;
    vocabularyId?: string;
    audioUrl: string;
    targetWord: string;
  }) {
    try {
      const attempt = await this.prisma.foundationPronunciationAttempt.create({
        data: {
          userId: data.userId,
          vocabularyId: data.vocabularyId,
          audioUrl: data.audioUrl,
          targetWord: data.targetWord,
          status: "PENDING",
        },
      });

      this.logger.log(`✅ Pronunciation attempt created: ${attempt.id}`);
      return attempt;
    } catch (error) {
      this.logger.error(
        `❌ Failed to create pronunciation attempt: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Update a pronunciation attempt with results
   * @param attemptId - Attempt ID
   * @param data - Update data (transcribedText, score, feedback, status)
   * @returns Updated pronunciation attempt
   */
  async updatePronunciationAttempt(
    attemptId: string,
    data: {
      transcribedText?: string;
      score?: number;
      feedback?: any;
      status?: string;
    },
  ) {
    try {
      const attempt = await this.prisma.foundationPronunciationAttempt.update({
        where: { id: attemptId },
        data: {
          transcribedText: data.transcribedText,
          score: data.score,
          feedback: data.feedback,
          status: data.status as any,
        },
      });

      this.logger.log(`✅ Pronunciation attempt updated: ${attemptId}`);
      return attempt;
    } catch (error) {
      this.logger.error(
        `❌ Failed to update pronunciation attempt: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get pronunciation attempts for a user
   * @param userId - User ID
   * @returns List of pronunciation attempts
   */
  async findUserPronunciationAttempts(userId: string) {
    try {
      const attempts = await this.prisma.foundationPronunciationAttempt.findMany({
        where: { userId },
        include: {
          vocabulary: {
            include: {
              lesson: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return attempts;
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch pronunciation attempts: ${error.message}`,
      );
      throw error;
    }
  }
}
