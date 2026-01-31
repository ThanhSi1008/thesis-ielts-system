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
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CreateVocabularyBookDto,
  UpdateVocabularyBookDto,
  CreateVocabularyUnitDto,
  UpdateVocabularyUnitDto,
  CreateVocabularyWordDto,
  UpdateVocabularyWordDto,
} from './dto/vocabulary.dto';

@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  // ==================== PUBLIC READ ENDPOINTS ====================

  @Get('books')
  async getBooks() {
    return this.vocabularyService.getBooks();
  }

  @Get('books/:id')
  async getBook(@Param('id') id: string) {
    const book = await this.vocabularyService.getBookWithUnits(id);
    if (!book) throw new NotFoundException('Vocabulary book not found');
    return book;
  }

  @Get('units/:id')
  async getUnit(@Param('id') id: string) {
    const unit = await this.vocabularyService.getUnitWithContent(id);
    if (!unit) throw new NotFoundException('Vocabulary unit not found');
    return unit;
  }

  // ==================== ADMIN BOOK ENDPOINTS ====================

  @Post('books')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createBook(@Body() dto: CreateVocabularyBookDto) {
    return this.vocabularyService.createBook(dto);
  }

  @Put('books/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateBook(@Param('id') id: string, @Body() dto: UpdateVocabularyBookDto) {
    return this.vocabularyService.updateBook(id, dto);
  }

  @Delete('books/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteBook(@Param('id') id: string) {
    return this.vocabularyService.deleteBook(id);
  }

  // ==================== ADMIN UNIT ENDPOINTS ====================

  @Post('units')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createUnit(@Body() dto: CreateVocabularyUnitDto) {
    return this.vocabularyService.createUnit(dto);
  }

  @Put('units/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateUnit(@Param('id') id: string, @Body() dto: UpdateVocabularyUnitDto) {
    return this.vocabularyService.updateUnit(id, dto);
  }

  @Delete('units/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteUnit(@Param('id') id: string) {
    return this.vocabularyService.deleteUnit(id);
  }

  // ==================== ADMIN WORD ENDPOINTS ====================

  @Post('words')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createWord(@Body() dto: CreateVocabularyWordDto) {
    return this.vocabularyService.createWord(dto);
  }

  @Put('words/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateWord(@Param('id') id: string, @Body() dto: UpdateVocabularyWordDto) {
    return this.vocabularyService.updateWord(id, dto);
  }

  @Delete('words/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteWord(@Param('id') id: string) {
    return this.vocabularyService.deleteWord(id);
  }
}
