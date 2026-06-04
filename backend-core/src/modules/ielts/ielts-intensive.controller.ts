import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "../../common/storage/storage.service";
import { IeltsIntensiveService } from "./ielts-intensive.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import {
  CreateExamDto,
  UpdateExamDto,
  CreateSessionDto,
  SubmitSessionDto,
  WritingResultCallbackDto,
} from "./dto/ielts-intensive.dto";

@Controller("exams")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class IeltsIntensiveController {
  constructor(
    private readonly ieltsIntensiveService: IeltsIntensiveService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  create(@Body() createExamDto: CreateExamDto) {
    return this.ieltsIntensiveService.create(createExamDto);
  }

  @Get()
  findAll() {
    return this.ieltsIntensiveService.findAll();
  }

  @Get("intensive/catalog")
  getIntensiveCatalog(@Request() req: any, @Query("skill") skill?: string) {
    return this.ieltsIntensiveService.getIntensiveCatalog({
      userId: req.user.id,
      skill,
    });
  }

  @Get("intensive/practice-catalog")
  getPracticeCatalog(@Request() req: any, @Query("skill") skill?: string) {
    return this.ieltsIntensiveService.getPracticeCatalog({
      userId: req.user.id,
      skill,
    });
  }

  @Get("history")
  getHistory(@Request() req: any) {
    return this.ieltsIntensiveService.getHistory(req.user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ieltsIntensiveService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.ieltsIntensiveService.update(id, updateExamDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.ieltsIntensiveService.remove(id);
  }

  @Post(":id/sessions")
  createSession(
    @Param("id") examId: string,
    @Body() createSessionDto: CreateSessionDto,
  ) {
    return this.ieltsIntensiveService.createSession(examId, createSessionDto);
  }

  @Get("sessions/:sessionId")
  getSession(@Param("sessionId") sessionId: string) {
    return this.ieltsIntensiveService.getSession(sessionId);
  }

  @Post("sessions/:sessionId/submit")
  submitSession(
    @Param("sessionId") sessionId: string,
    @Body() submitDto: SubmitSessionDto,
  ) {
    return this.ieltsIntensiveService.submitSession(sessionId, submitDto);
  }

  @Delete("sessions/:sessionId")
  deleteSession(@Param("sessionId") sessionId: string) {
    return this.ieltsIntensiveService.deleteSession(sessionId);
  }

  @Post("audio/upload")
  @UseInterceptors(FileInterceptor("audio"))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Audio file is required");
    }
    const audioUrl = await this.storageService.uploadFile(file, "exams_audio");
    return { url: audioUrl };
  }
}
