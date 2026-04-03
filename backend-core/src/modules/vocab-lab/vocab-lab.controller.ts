import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VocabLabService } from './vocab-lab.service';
import { StorageService } from '../../common/storage/storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateDeckDto, CreateFlashcardDto, UpdateFlashcardDto, SubmitReviewDto,
  CreateNoteTypeDto, RenameNoteTypeDto, UpdateNoteTypeDescriptionDto,
  CreateNoteTypeFieldDto, UpdateNoteTypeFieldDto, UpdateCardTemplateDto,
} from './dto/vocab-lab.dto';
import { CardState } from '@prisma/client';

@Controller('vocab-lab')
@UseGuards(JwtAuthGuard)
export class VocabLabController {
  constructor(
    private readonly vocabLabService: VocabLabService,
    private readonly storageService: StorageService,
  ) { }

  // ==================== NOTE TYPE ENDPOINTS ====================

  @Get('note-types')
  async getNoteTypes(@Request() req: any) {
    return this.vocabLabService.getNoteTypes(req.user.id);
  }

  @Post('note-types')
  async createNoteType(@Request() req: any, @Body() dto: CreateNoteTypeDto) {
    return this.vocabLabService.createNoteType(req.user.id, dto);
  }

  @Patch('note-types/:id')
  async renameNoteType(@Request() req: any, @Param('id') id: string, @Body() dto: RenameNoteTypeDto) {
    return this.vocabLabService.renameNoteType(req.user.id, id, dto);
  }

  @Patch('note-types/:id/description')
  async updateNoteTypeDescription(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateNoteTypeDescriptionDto) {
    return this.vocabLabService.updateNoteTypeDescription(id, dto);
  }

  @Delete('note-types/:id')
  async deleteNoteType(@Request() req: any, @Param('id') id: string) {
    return this.vocabLabService.deleteNoteType(req.user.id, id);
  }

  @Post('note-types/:id/fields')
  async addField(@Request() req: any, @Param('id') id: string, @Body() dto: CreateNoteTypeFieldDto) {
    return this.vocabLabService.addField(req.user.id, id, dto);
  }

  @Patch('note-types/:id/fields/:fid')
  async updateField(@Request() req: any, @Param('id') id: string, @Param('fid') fid: string, @Body() dto: UpdateNoteTypeFieldDto) {
    return this.vocabLabService.updateField(req.user.id, id, fid, dto);
  }

  @Delete('note-types/:id/fields/:fid')
  async deleteField(@Request() req: any, @Param('id') id: string, @Param('fid') fid: string) {
    return this.vocabLabService.deleteField(req.user.id, id, fid);
  }

  @Get('note-types/:id/templates')
  async getTemplates(@Request() req: any, @Param('id') id: string) {
    return this.vocabLabService.getTemplates(req.user.id, id);
  }

  @Patch('note-types/:id/templates/:tid')
  async updateTemplate(@Request() req: any, @Param('id') id: string, @Param('tid') tid: string, @Body() dto: UpdateCardTemplateDto) {
    return this.vocabLabService.updateTemplate(req.user.id, id, tid, dto);
  }

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

  // ==================== MEDIA UPLOAD ====================

  @Post('media/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    const url = await this.storageService.uploadFile(file, 'vocab_media');
    return { url };
  }
}
