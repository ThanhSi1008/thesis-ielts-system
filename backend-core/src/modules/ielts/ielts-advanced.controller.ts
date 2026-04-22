import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IeltsAdvancedService } from './ielts-advanced.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ielts/advanced')
@UseGuards(JwtAuthGuard)
export class IeltsAdvancedController {
  constructor(private readonly advancedService: IeltsAdvancedService) {}

  @Get('listening')
  async getListeningParts(@Query('questionType') questionType?: string) {
    return this.advancedService.getListeningParts(questionType);
  }

  @Get('listening/:id')
  async getListeningPartDetail(@Param('id') id: string) {
    return this.advancedService.getListeningPartDetail(id);
  }

  @Post('listening/:id/submit')
  async submitListeningPart(
    @Param('id') id: string,
    @Body() payload: { answers: Record<string, string> },
    @Request() req: any,
  ) {
    return this.advancedService.submitListeningPart(req.user.id, id, payload);
  }

  @Get('statistics')
  async getStatistics(@Request() req: any) {
    return this.advancedService.getStatistics(req.user.id);
  }

  @Get('history')
  async getHistory(@Request() req: any, @Query('partId') partId?: string) {
    return this.advancedService.getHistory(req.user.id, partId);
  }

  @Get('history/:id')
  async getHistoryDetail(@Request() req: any, @Param('id') sessionId: string) {
    return this.advancedService.getHistoryDetail(req.user.id, sessionId);
  }
}
