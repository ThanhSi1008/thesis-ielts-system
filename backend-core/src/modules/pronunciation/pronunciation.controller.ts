import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PronunciationService } from "./pronunciation.service";
import { StorageService } from "../../common/storage/storage.service";
import { AiClientService } from "../ai-client/ai-client.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UsageQuotaGuard } from "../subscriptions/guards/usage-quota.guard";
import { RequiresQuota } from "../subscriptions/decorators/requires-quota.decorator";
import {
  CreatePronunciationSoundDto,
  UpdatePronunciationSoundDto,
  UpdateProgressDto,
  CheckPronunciationDto,
} from "./dto/pronunciation.dto";

const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/wav", "audio/vnd.wave", "audio/x-wav",
  "audio/mpeg", "audio/mp3", "audio/mp4",
  "audio/m4a", "audio/x-m4a", "audio/aac",
  "audio/webm", "audio/3gpp",
];

@Controller("pronunciation")
export class PronunciationController {
  constructor(
    private readonly pronunciationService: PronunciationService,
    private readonly storageService: StorageService,
    private readonly aiClientService: AiClientService,
  ) {}

  // ==================== PUBLIC READ ENDPOINTS ====================

  @Get("sounds")
  async getSounds() {
    return this.pronunciationService.getAllSounds();
  }

  @Get("sounds/:symbol")
  async getSound(@Param("symbol") symbol: string) {
    const sound = await this.pronunciationService.getSoundBySymbol(symbol);
    if (!sound) throw new NotFoundException("Pronunciation sound not found");
    return sound;
  }

  // ==================== PROGRESS ENDPOINTS (Authenticated) ====================

  @Get("progress")
  @UseGuards(JwtAuthGuard)
  async getUserProgress(@Req() req: any) {
    return this.pronunciationService.getUserProgress(req.user.id);
  }

  @Get("progress/stats")
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Req() req: any) {
    return this.pronunciationService.getUserStats(req.user.id);
  }

  @Get("sounds/:soundId/word-progress")
  @UseGuards(JwtAuthGuard)
  async getWordProgress(@Req() req: any, @Param("soundId") soundId: string) {
    return this.pronunciationService.getWordProgress(req.user.id, soundId);
  }

  @Post("progress")
  @UseGuards(JwtAuthGuard)
  async updateProgress(@Req() req: any, @Body() dto: UpdateProgressDto) {
    return this.pronunciationService.updateProgress(req.user.id, dto.soundId, dto.score);
  }

  // ==================== ADMIN SOUND ENDPOINTS ====================

  @Post("sounds")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async createSound(@Body() dto: CreatePronunciationSoundDto) {
    return this.pronunciationService.createSound(dto);
  }

  @Put("sounds/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async updateSound(
    @Param("id") id: string,
    @Body() dto: UpdatePronunciationSoundDto,
  ) {
    return this.pronunciationService.updateSound(id, dto);
  }

  @Delete("sounds/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async deleteSound(@Param("id") id: string) {
    return this.pronunciationService.deleteSound(id);
  }

  // ==================== PRONUNCIATION CHECK (AI grading) ====================

  @Post("check")
  @UseGuards(JwtAuthGuard, UsageQuotaGuard)
  @RequiresQuota("PRONUNCIATION_ATTEMPT")
  @UseInterceptors(FileInterceptor("audio"))
  async checkPronunciation(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CheckPronunciationDto,
  ) {
    if (!file) throw new BadRequestException("Audio file is required");
    if (!ALLOWED_AUDIO_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed: ${ALLOWED_AUDIO_MIME_TYPES.join(", ")}`);
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException("File size exceeds 10MB limit");
    }

    const audioUrl = await this.storageService.uploadFile(file, "pronunciation");

    let targetWord = body.targetWord;
    if (!targetWord) throw new BadRequestException("targetWord is required");

    const attempt = await this.pronunciationService.createPronunciationAttempt({
      userId: body.userId,
      vocabularyId: body.vocabularyId,
      audioUrl,
      targetWord,
    });

    await this.aiClientService["channel"].assertQueue("pronunciation-check-queue", { durable: true });
    this.aiClientService["channel"].sendToQueue(
      "pronunciation-check-queue",
      Buffer.from(JSON.stringify({ attemptId: attempt.id, audioUrl, targetWord, userId: body.userId, vocabularyId: body.vocabularyId })),
      { persistent: true },
    );

    return { attemptId: attempt.id, status: "PENDING", message: "Pronunciation check queued for processing" };
  }

  @Get("attempts/:userId")
  @UseGuards(JwtAuthGuard)
  async getUserAttempts(@Param("userId") userId: string) {
    return this.pronunciationService.findUserPronunciationAttempts(userId);
  }
}
