import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exams')
@UseGuards(JwtAuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(@Body() createExamDto: any) {
    return this.examsService.create(createExamDto);
  }

  @Get()
  findAll() {
    return this.examsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExamDto: any) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examsService.remove(id);
  }

  @Post(':id/sessions')
  createSession(@Param('id') examId: string, @Body() createSessionDto: any) {
    return this.examsService.createSession(examId, createSessionDto);
  }

  @Post('sessions/:sessionId/submit')
  submitSession(@Param('sessionId') sessionId: string, @Body() submitDto: any) {
    return this.examsService.submitSession(sessionId, submitDto);
  }
}

