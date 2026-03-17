import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VocabLabService } from './vocab-lab.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDeckDto, CreateFlashcardDto, UpdateFlashcardDto, SubmitReviewDto } from './dto/vocab-lab.dto';
import { CardState } from '@prisma/client';

@Controller('vocab-lab')
@UseGuards(JwtAuthGuard)
export class VocabLabController {
  constructor(private readonly vocabLabService: VocabLabService) { }

  // ==================== DECK ENDPOINTS ====================

  @Get('decks')
  async getDecks(@Request() req: any) {
    return this.vocabLabService.getDecks(req.user.id);
  }

  @Get('decks/:id')
  async getDeckDetail(@Request() req: any, @Param('id') id: string) {
    return this.vocabLabService.getDeckDetail(req.user.id, id);
  }

  @Post('decks')
  async createDeck(@Request() req: any, @Body() dto: CreateDeckDto) {
    return this.vocabLabService.createDeck(req.user.id, dto);
  }

  @Delete('decks/:id')
  async deleteDeck(@Request() req: any, @Param('id') id: string) {
    return this.vocabLabService.deleteDeck(req.user.id, id);
  }

  // ==================== FLASHCARD ENDPOINTS ====================

  @Post('cards')
  async createFlashcard(@Request() req: any, @Body() dto: CreateFlashcardDto) {
    return this.vocabLabService.createFlashcard(req.user.id, dto);
  }

  @Put('cards/:id')
  async updateFlashcard(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateFlashcardDto) {
    return this.vocabLabService.updateFlashcard(req.user.id, id, dto);
  }

  @Delete('cards/:id')
  async deleteFlashcard(@Request() req: any, @Param('id') id: string) {
    return this.vocabLabService.deleteFlashcard(req.user.id, id);
  }

  @Get('cards')
  async browseCards(
    @Request() req: any,
    @Query('deckId') deckId?: string,
    @Query('cardState') cardState?: CardState,
    @Query('tag') tag?: string,
  ) {
    return this.vocabLabService.browseCards(req.user.id, { deckId, cardState, tag });
  }

  // ==================== STUDY / REVIEW ENDPOINTS ====================

  @Get('study/:deckId')
  async getStudyCards(@Request() req: any, @Param('deckId') deckId: string) {
    return this.vocabLabService.getStudyCards(req.user.id, deckId);
  }

  @Post('review')
  async submitReview(@Request() req: any, @Body() dto: SubmitReviewDto) {
    return this.vocabLabService.submitReview(req.user.id, dto);
  }

  // ==================== STATS & TAGS ====================

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.vocabLabService.getStats(req.user.id);
  }

  @Get('tags')
  async getTags(@Request() req: any) {
    return this.vocabLabService.getTags(req.user.id);
  }
}
