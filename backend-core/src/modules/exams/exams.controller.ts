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
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateExamDto,
  UpdateExamDto,
  CreateSessionDto,
  SubmitSessionDto,
} from './dto/exams.dto';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.create(createExamDto);
  }

  @Get()
  findAll() {
    return this.examsService.findAll();
  }

  @Get('intensive/catalog')
  getIntensiveCatalog(@Request() req: any, @Query('skill') skill?: string) {
    return this.examsService.getIntensiveCatalog({
      userId: req.user.id,
      skill,
    });
  }

  @Get('history')
  getHistory(@Request() req: any) {
    return this.examsService.getHistory(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }

  @Post(':id/sessions')
  createSession(
    @Param('id') examId: string,
    @Body() createSessionDto: CreateSessionDto,
  ) {
    return this.examsService.createSession(examId, createSessionDto);
  }

  @Get('sessions/:sessionId')
  getSession(@Param('sessionId') sessionId: string) {
    return this.examsService.getSession(sessionId);
  }

  @Post('sessions/:sessionId/submit')
  submitSession(
    @Param('sessionId') sessionId: string,
    @Body() submitDto: SubmitSessionDto,
  ) {
    return this.examsService.submitSession(sessionId, submitDto);
  }
}
