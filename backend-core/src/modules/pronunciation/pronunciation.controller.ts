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
} from "@nestjs/common";
import { PronunciationService } from "./pronunciation.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import {
  CreatePronunciationSoundDto,
  UpdatePronunciationSoundDto,
} from "./dto/pronunciation.dto";

@Controller("pronunciation")
export class PronunciationController {
  constructor(private readonly pronunciationService: PronunciationService) {}

  // ==================== PUBLIC READ ENDPOINTS ====================

  @Get("sounds")
  async getSounds() {
    return this.pronunciationService.getAllSounds();
  }

  @Get("sounds/:symbol")
  async getSound(@Param("symbol") symbol: string) {
    const sound = await this.pronunciationService.getSoundBySymbol(symbol);
    if (!sound) throw new NotFoundException("Pronunciation sound not found");
    return sound;
  }

  // ==================== ADMIN SOUND ENDPOINTS ====================

  @Post("sounds")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async createSound(@Body() dto: CreatePronunciationSoundDto) {
    return this.pronunciationService.createSound(dto);
  }

  @Put("sounds/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async updateSound(
    @Param("id") id: string,
    @Body() dto: UpdatePronunciationSoundDto,
  ) {
    return this.pronunciationService.updateSound(id, dto);
  }

  @Delete("sounds/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async deleteSound(@Param("id") id: string) {
    return this.pronunciationService.deleteSound(id);
  }
}
