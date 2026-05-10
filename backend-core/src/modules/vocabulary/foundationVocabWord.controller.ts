import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  UseGuards,
  Request,
} from "@nestjs/common";
import { VocabularyService } from "./foundationVocabWord.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  CreateVocabularyBookDto,
  UpdateVocabularyBookDto,
  CreateVocabularyUnitDto,
  UpdateVocabularyUnitDto,
  CreateVocabularyWordDto,
  UpdateVocabularyWordDto,
} from "./dto/foundationVocabWord.dto";
import {
  UpdateWordProgressDto,
  SubmitExerciseDto,
  SubmitQuestionsDto,
} from "./dto/progress.dto";

@Controller("foundationVocabWord")
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  // ==================== PUBLIC READ ENDPOINTS ====================

  @Get("books")
  async getBooks() {
    return this.vocabularyService.getBooks();
  }

  @Get("books/:id")
  async getBook(@Param("id") id: string) {
    const book = await this.vocabularyService.getBookWithUnits(id);
    if (!book) throw new NotFoundException("FoundationVocabWord book not found");
    return book;
  }

  @Get("units/:id")
  async getUnit(@Param("id") id: string) {
    const unit = await this.vocabularyService.getUnitWithContent(id);
    if (!unit) throw new NotFoundException("FoundationVocabWord unit not found");
    return unit;
  }

  // ==================== USER PROGRESS ENDPOINTS ====================

  @Get("progress/:bookId")
  @UseGuards(JwtAuthGuard)
  async getUserProgress(@Param("bookId") bookId: string, @Request() req: any) {
    const progress = await this.vocabularyService.getUserProgress(
      req.user.id,
      bookId,
    );
    if (!progress) throw new NotFoundException("Book not found");
    return progress;
  }

  @Post("progress/words")
  @UseGuards(JwtAuthGuard)
  async updateWordProgress(
    @Body() dto: UpdateWordProgressDto,
    @Request() req: any,
  ) {
    return this.vocabularyService.updateWordProgress(
      req.user.id,
      dto.unitId,
      dto.wordsLearned,
    );
  }

  @Post("progress/exercise")
  @UseGuards(JwtAuthGuard)
  async submitExercise(@Body() dto: SubmitExerciseDto, @Request() req: any) {
    return this.vocabularyService.submitExercise(
      req.user.id,
      dto.unitId,
      dto.answers,
    );
  }

  @Post("progress/questions")
  @UseGuards(JwtAuthGuard)
  async submitQuestions(@Body() dto: SubmitQuestionsDto, @Request() req: any) {
    return this.vocabularyService.submitQuestions(
      req.user.id,
      dto.unitId,
      dto.answers,
    );
  }

  // ==================== ADMIN BOOK ENDPOINTS ====================

  @Post("books")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async createBook(@Body() dto: CreateVocabularyBookDto) {
    return this.vocabularyService.createBook(dto);
  }

  @Put("books/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async updateBook(
    @Param("id") id: string,
    @Body() dto: UpdateVocabularyBookDto,
  ) {
    return this.vocabularyService.updateBook(id, dto);
  }

  @Delete("books/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async deleteBook(@Param("id") id: string) {
    return this.vocabularyService.deleteBook(id);
  }

  // ==================== ADMIN UNIT ENDPOINTS ====================

  @Post("units")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async createUnit(@Body() dto: CreateVocabularyUnitDto) {
    return this.vocabularyService.createUnit(dto);
  }

  @Put("units/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async updateUnit(
    @Param("id") id: string,
    @Body() dto: UpdateVocabularyUnitDto,
  ) {
    return this.vocabularyService.updateUnit(id, dto);
  }

  @Delete("units/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async deleteUnit(@Param("id") id: string) {
    return this.vocabularyService.deleteUnit(id);
  }

  // ==================== ADMIN WORD ENDPOINTS ====================

  @Post("words")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async createWord(@Body() dto: CreateVocabularyWordDto) {
    return this.vocabularyService.createWord(dto);
  }

  @Put("words/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async updateWord(
    @Param("id") id: string,
    @Body() dto: UpdateVocabularyWordDto,
  ) {
    return this.vocabularyService.updateWord(id, dto);
  }

  @Delete("words/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async deleteWord(@Param("id") id: string) {
    return this.vocabularyService.deleteWord(id);
  }
}
