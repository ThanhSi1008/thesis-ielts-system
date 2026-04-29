import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { LearningService } from "./learning.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateLessonDto } from "./dto/create-lesson.dto";
import { CreateVocabularyDto } from "./dto/create-vocabulary.dto";
import { CreateGrammarDto } from "./dto/create-grammar.dto";
import { UpdateProgressDto } from "./dto/update-progress.dto";
import { CheckPronunciationDto } from "./dto/check-pronunciation.dto";
import { StorageService } from "../../common/storage/storage.service";
import { AiClientService } from "../ai-client/ai-client.service";

/**
 * Learning Controller
 * Handles HTTP requests for learning materials, lessons, vocabulary, grammar, and pronunciation
 */
@Controller("learning")
@UseGuards(JwtAuthGuard)
export class LearningController {
  private readonly logger = new Logger(LearningController.name);

  constructor(
    private readonly learningService: LearningService,
    private readonly storageService: StorageService,
    private readonly aiClientService: AiClientService,
  ) {}

  // ==================== EXISTING ENDPOINTS ====================

  @Get("materials")
  findAllMaterials() {
    return this.learningService.findAllMaterials();
  }

  @Get("materials/:id")
  findOneMaterial(@Param("id") id: string) {
    return this.learningService.findOneMaterial(id);
  }

  @Get("progress/:userId")
  findUserProgress(@Param("userId") userId: string) {
    return this.learningService.findUserProgress(userId);
  }

  @Post("progress")
  updateProgress(@Body() updateProgressDto: UpdateProgressDto) {
    return this.learningService.updateProgress(updateProgressDto);
  }

  // ==================== LESSON ENDPOINTS ====================

  /**
   * Get all published lessons with optional filtering
   * @param difficulty - Optional difficulty filter (BEGINNER, INTERMEDIATE, ADVANCED)
   */
  @Get("lessons")
  async findAllLessons(@Query("difficulty") difficulty?: string) {
    return this.learningService.findAllLessons({
      difficulty,
      isPublished: true,
    });
  }

  /**
   * Get a single lesson with all vocabulary and grammar items
   * @param id - Lesson ID
   */
  @Get("lessons/:id")
  async findLessonById(@Param("id") id: string) {
    return this.learningService.findLessonById(id);
  }

  /**
   * Create a new lesson (Admin only)
   * @param createLessonDto - Lesson data
   */
  @Post("lessons")
  async createLesson(@Body() createLessonDto: CreateLessonDto) {
    // TODO: Add RolesGuard and @Roles('ADMIN') decorator
    return this.learningService.createLesson(createLessonDto);
  }

  // ==================== VOCABULARY ENDPOINTS ====================

  /**
   * Get all vocabulary for a lesson
   * @param lessonId - Lesson ID
   */
  @Get("vocabulary/:lessonId")
  async findVocabularyByLesson(@Param("lessonId") lessonId: string) {
    return this.learningService.findVocabularyByLesson(lessonId);
  }

  /**
   * Add vocabulary to a lesson (Admin only)
   * @param createVocabularyDto - Vocabulary data
   */
  @Post("vocabulary")
  async createVocabulary(@Body() createVocabularyDto: CreateVocabularyDto) {
    // TODO: Add RolesGuard and @Roles('ADMIN') decorator
    return this.learningService.createVocabulary(createVocabularyDto);
  }

  // ==================== GRAMMAR ENDPOINTS ====================

  /**
   * Get all grammar for a lesson
   * @param lessonId - Lesson ID
   */
  @Get("grammar/:lessonId")
  async findGrammarByLesson(@Param("lessonId") lessonId: string) {
    return this.learningService.findGrammarByLesson(lessonId);
  }

  /**
   * Add grammar to a lesson (Admin only)
   * @param createGrammarDto - Grammar data
   */
  @Post("grammar")
  async createGrammar(@Body() createGrammarDto: CreateGrammarDto) {
    // TODO: Add RolesGuard and @Roles('ADMIN') decorator
    return this.learningService.createGrammar(createGrammarDto);
  }

  // ==================== PRONUNCIATION ENDPOINT ====================

  /**
   * Upload audio for pronunciation checking
   * Accepts multipart/form-data with fields: audio (file), vocabularyId (string), userId (string)
   * @param file - Audio file (wav, mp3, webm)
   * @param body - Request body with vocabularyId and userId
   */
  @Post("pronunciation/check")
  @UseInterceptors(FileInterceptor("audio"))
  async checkPronunciation(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CheckPronunciationDto,
  ) {
    try {
      // Validate file
      if (!file) {
        throw new BadRequestException("Audio file is required");
      }

      // DEBUG: log actual received MIME (remove after confirming iOS sends correct type)
      this.logger.log(`📎 Received audio file: name=${file.originalname}, mimetype=${file.mimetype}, size=${file.size}`);

      // Validate file type
      // Mobile clients (iOS/Android) may produce different MIME types:
      // - iOS expo-audio WAV: audio/wav or audio/x-wav
      // - iOS expo-audio M4A: audio/mp4 or audio/x-m4a or audio/m4a
      // - Android: audio/mpeg, audio/mp4, audio/3gpp
      // - Web: audio/webm
      const allowedMimeTypes = [
        'audio/wav',
        'audio/vnd.wave', // ← iOS NSURLSession sets this for WAV (IANA RFC 2361)
        'audio/x-wav',
        'audio/mpeg',
        'audio/mp3',
        'audio/mp4',
        'audio/m4a',
        'audio/x-m4a',
        'audio/aac',
        'audio/webm',
        'audio/3gpp',
      ];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`,
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException("File size exceeds 10MB limit");
      }

      this.logger.log(
        `📤 Pronunciation check request - User: ${body.userId}, Vocabulary: ${body.vocabularyId}`,
      );

      // Upload file to storage
      const audioUrl = await this.storageService.uploadFile(
        file,
        "pronunciation",
      );
      this.logger.log(`✅ Audio uploaded: ${audioUrl}`);

      let targetWord = body.targetWord;

      // If vocabularyId is provided, verify it and get the word
      if (body.vocabularyId) {
        const vocabulary = await this.learningService[
          "prisma"
        ].vocabulary.findUnique({
          where: { id: body.vocabularyId },
        });

        if (!vocabulary) {
          throw new BadRequestException(
            `Vocabulary with ID ${body.vocabularyId} not found`,
          );
        }
        targetWord = vocabulary.word;
      }

      if (!targetWord) {
        throw new BadRequestException(
          "Either vocabularyId or targetWord must be provided",
        );
      }

      // Create pronunciation attempt record
      const attempt = await this.learningService.createPronunciationAttempt({
        userId: body.userId,
        vocabularyId: body.vocabularyId, // Can be undefined
        audioUrl,
        targetWord: targetWord,
      });

      // Publish message to RabbitMQ pronunciation-check-queue
      await this.aiClientService["channel"].assertQueue(
        "pronunciation-check-queue",
        {
          durable: true,
        },
      );

      const message = {
        attemptId: attempt.id,
        audioUrl,
        targetWord: targetWord,
        userId: body.userId,
        vocabularyId: body.vocabularyId,
      };

      this.aiClientService["channel"].sendToQueue(
        "pronunciation-check-queue",
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      );

      this.logger.log(`📤 Pronunciation check task published: ${attempt.id}`);

      return {
        attemptId: attempt.id,
        status: "PENDING",
        message: "Pronunciation check queued for processing",
      };
    } catch (error) {
      this.logger.error(`❌ Pronunciation check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get pronunciation attempts for a user
   * @param userId - User ID
   */
  @Get("pronunciation/attempts/:userId")
  async getUserPronunciationAttempts(@Param("userId") userId: string) {
    return this.learningService.findUserPronunciationAttempts(userId);
  }
}
