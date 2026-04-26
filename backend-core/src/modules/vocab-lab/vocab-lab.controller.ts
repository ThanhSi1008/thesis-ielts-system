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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { VocabLabService } from "./vocab-lab.service";
import { StorageService } from "../../common/storage/storage.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import {
  CreateDeckDto,
  CreateFlashcardDto,
  UpdateFlashcardDto,
  SubmitReviewDto,
  CreateCardTypeDto,
  RenameCardTypeDto,
  UpdateCardTypeDescriptionDto,
  CreateCardTypeFieldDto,
  UpdateCardTypeFieldDto,
  UpdateCardTemplateDto,
} from "./dto/vocab-lab.dto";
import { CardState } from "@prisma/client";

@Controller("vocab-lab")
@UseGuards(JwtAuthGuard)
export class VocabLabController {
  constructor(
    private readonly vocabLabService: VocabLabService,
    private readonly storageService: StorageService,
  ) {}

  // ==================== NOTE TYPE ENDPOINTS ====================

  @Get("card-types")
  async getCardTypes(@Request() req: any) {
    return this.vocabLabService.getCardTypes(req.user.id);
  }

  @Post("card-types")
  async createCardType(@Request() req: any, @Body() dto: CreateCardTypeDto) {
    return this.vocabLabService.createCardType(req.user.id, dto);
  }

  @Patch("card-types/:id")
  async renameCardType(
    @Request() req: any,
    @Param("id") id: string,
    @Body() dto: RenameCardTypeDto,
  ) {
    return this.vocabLabService.renameCardType(req.user.id, id, dto);
  }

  @Patch("card-types/:id/description")
  async updateCardTypeDescription(
    @Request() req: any,
    @Param("id") id: string,
    @Body() dto: UpdateCardTypeDescriptionDto,
  ) {
    return this.vocabLabService.updateCardTypeDescription(id, dto);
  }

  @Delete("card-types/:id")
  async deleteCardType(@Request() req: any, @Param("id") id: string) {
    return this.vocabLabService.deleteCardType(req.user.id, id);
  }

  @Post("card-types/:id/fields")
  async addField(
    @Request() req: any,
    @Param("id") id: string,
    @Body() dto: CreateCardTypeFieldDto,
  ) {
    return this.vocabLabService.addField(req.user.id, id, dto);
  }

  @Patch("card-types/:id/fields/:fid")
  async updateField(
    @Request() req: any,
    @Param("id") id: string,
    @Param("fid") fid: string,
    @Body() dto: UpdateCardTypeFieldDto,
  ) {
    return this.vocabLabService.updateField(req.user.id, id, fid, dto);
  }

  @Delete("card-types/:id/fields/:fid")
  async deleteField(
    @Request() req: any,
    @Param("id") id: string,
    @Param("fid") fid: string,
  ) {
    return this.vocabLabService.deleteField(req.user.id, id, fid);
  }

  @Get("card-types/:id/templates")
  async getTemplates(@Request() req: any, @Param("id") id: string) {
    return this.vocabLabService.getTemplates(req.user.id, id);
  }

  @Patch("card-types/:id/templates/:tid")
  async updateTemplate(
    @Request() req: any,
    @Param("id") id: string,
    @Param("tid") tid: string,
    @Body() dto: UpdateCardTemplateDto,
  ) {
    return this.vocabLabService.updateTemplate(req.user.id, id, tid, dto);
  }

  // ==================== DECK ENDPOINTS ====================

  @Get("decks")
  async getDecks(@Request() req: any) {
    return this.vocabLabService.getDecks(req.user.id);
  }

  @Get("decks/:id")
  async getDeckDetail(@Request() req: any, @Param("id") id: string) {
    return this.vocabLabService.getDeckDetail(req.user.id, id);
  }

  @Post("decks")
  async createDeck(@Request() req: any, @Body() dto: CreateDeckDto) {
    return this.vocabLabService.createDeck(req.user.id, dto);
  }

  @Delete("decks/:id")
  async deleteDeck(@Request() req: any, @Param("id") id: string) {
    return this.vocabLabService.deleteDeck(req.user.id, id);
  }

  // ==================== FLASHCARD ENDPOINTS ====================

  @Post("cards")
  async createFlashcard(@Request() req: any, @Body() dto: CreateFlashcardDto) {
    return this.vocabLabService.createFlashcard(req.user.id, dto);
  }

  @Put("cards/:id")
  async updateFlashcard(
    @Request() req: any,
    @Param("id") id: string,
    @Body() dto: UpdateFlashcardDto,
  ) {
    return this.vocabLabService.updateFlashcard(req.user.id, id, dto);
  }

  @Delete("cards/:id")
  async deleteFlashcard(@Request() req: any, @Param("id") id: string) {
    return this.vocabLabService.deleteFlashcard(req.user.id, id);
  }

  @Get("cards")
  async browseCards(
    @Request() req: any,
    @Query("deckId") deckId?: string,
    @Query("cardState") cardState?: CardState,
    @Query("tag") tag?: string,
  ) {
    return this.vocabLabService.browseCards(req.user.id, {
      deckId,
      cardState,
      tag,
    });
  }

  // ==================== STUDY / REVIEW ENDPOINTS ====================

  @Get("study/:deckId")
  async getStudyCards(@Request() req: any, @Param("deckId") deckId: string) {
    return this.vocabLabService.getStudyCards(req.user.id, deckId);
  }

  @Post("review")
  async submitReview(@Request() req: any, @Body() dto: SubmitReviewDto) {
    return this.vocabLabService.submitReview(req.user.id, dto);
  }

  // ==================== STATS & TAGS ====================

  @Get("stats")
  async getStats(@Request() req: any) {
    return this.vocabLabService.getStats(req.user.id);
  }

  @Get("tags")
  async getTags(@Request() req: any) {
    return this.vocabLabService.getTags(req.user.id);
  }

  // ==================== MEDIA UPLOAD ====================

  @Post("media/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("File is required");
    const url = await this.storageService.uploadFile(file, "vocab_media");
    return { url };
  }
}
