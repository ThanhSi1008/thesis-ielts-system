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
import { ExamsService } from "./exams.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import {
  CreateExamDto,
  UpdateExamDto,
  CreateSessionDto,
  SubmitSessionDto,
  WritingResultCallbackDto,
} from "./dto/exams.dto";

@Controller("exams")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.create(createExamDto);
  }

  @Get()
  findAll() {
    return this.examsService.findAll();
  }

  @Get("intensive/catalog")
  getIntensiveCatalog(@Request() req: any, @Query("skill") skill?: string) {
    return this.examsService.getIntensiveCatalog({
      userId: req.user.id,
      skill,
    });
  }

  @Get("intensive/practice-catalog")
  getPracticeCatalog(@Request() req: any, @Query("skill") skill?: string) {
    return this.examsService.getPracticeCatalog({
      userId: req.user.id,
      skill,
    });
  }

  @Get("history")
  getHistory(@Request() req: any) {
    return this.examsService.getHistory(req.user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  update(@Param("id") id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id") id: string) {
    return this.examsService.remove(id);
  }

  @Post(":id/sessions")
  createSession(
    @Param("id") examId: string,
    @Body() createSessionDto: CreateSessionDto,
  ) {
    return this.examsService.createSession(examId, createSessionDto);
  }

  @Get("sessions/:sessionId")
  getSession(@Param("sessionId") sessionId: string) {
    return this.examsService.getSession(sessionId);
  }

  @Post("sessions/:sessionId/submit")
  submitSession(
    @Param("sessionId") sessionId: string,
    @Body() submitDto: SubmitSessionDto,
  ) {
    return this.examsService.submitSession(sessionId, submitDto);
  }

  @Delete("sessions/:sessionId")
  deleteSession(@Param("sessionId") sessionId: string) {
    return this.examsService.deleteSession(sessionId);
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
