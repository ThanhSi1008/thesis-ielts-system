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
  Req,
} from "@nestjs/common";
import { GrammarService } from "./grammar.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  CreateGrammarBookDto,
  UpdateGrammarBookDto,
  CreateGrammarUnitDto,
  UpdateGrammarUnitDto,
  UpdateGrammarProgressDto,
} from "./dto/grammar.dto";

@Controller("grammar")
export class GrammarController {
  constructor(private readonly grammarService: GrammarService) {}

  // ==================== PUBLIC READ ENDPOINTS ====================

  @Get("books")
  async getBooks() {
    return this.grammarService.getBooks();
  }

  @Get("books/:slug")
  async getBook(@Param("slug") slug: string) {
    const book = await this.grammarService.getBookBySlug(slug);
    if (!book) throw new NotFoundException("Grammar book not found");
    return book;
  }

  @Get("units/:id")
  async getUnit(@Param("id") id: string) {
    const unit = await this.grammarService.getUnitWithContent(id);
    if (!unit) throw new NotFoundException("Grammar unit not found");
    return unit;
  }

  @Get("books/:slug/units/:order")
  async getUnitByOrder(
    @Param("slug") slug: string,
    @Param("order") order: string,
  ) {
    const unit = await this.grammarService.getUnitByBookAndOrder(slug, parseInt(order, 10));
    if (!unit) throw new NotFoundException("Grammar unit not found");
    return unit;
  }

  // ==================== PROGRESS ENDPOINTS ====================

  @Get("progress/:bookSlug")
  @UseGuards(JwtAuthGuard)
  async getProgress(
    @Req() req: any,
    @Param("bookSlug") bookSlug: string,
  ) {
    return this.grammarService.getProgress(req.user.id, bookSlug);
  }

  @Post("progress")
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @Req() req: any,
    @Body() dto: UpdateGrammarProgressDto,
  ) {
    return this.grammarService.updateProgress(req.user.id, dto);
  }

  // ==================== ADMIN BOOK ENDPOINTS ====================

  @Post("books")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async createBook(@Body() dto: CreateGrammarBookDto) {
    return this.grammarService.createBook(dto);
  }

  @Put("books/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async updateBook(@Param("id") id: string, @Body() dto: UpdateGrammarBookDto) {
    return this.grammarService.updateBook(id, dto);
  }

  @Delete("books/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async deleteBook(@Param("id") id: string) {
    return this.grammarService.deleteBook(id);
  }

  // ==================== ADMIN UNIT ENDPOINTS ====================

  @Post("units")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async createUnit(@Body() dto: CreateGrammarUnitDto) {
    return this.grammarService.createUnit(dto);
  }

  @Put("units/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async updateUnit(@Param("id") id: string, @Body() dto: UpdateGrammarUnitDto) {
    return this.grammarService.updateUnit(id, dto);
  }

  @Delete("units/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async deleteUnit(@Param("id") id: string) {
    return this.grammarService.deleteUnit(id);
  }
}
