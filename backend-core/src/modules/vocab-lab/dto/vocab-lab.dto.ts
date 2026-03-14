import { IsString, IsOptional, IsInt, IsArray, Min, Max } from 'class-validator';

// ==================== DECK DTOs ====================

export class CreateDeckDto {
  @IsString()
  name: string;
}

// ==================== FLASHCARD DTOs ====================

export class CreateFlashcardDto {
  @IsString()
  deckId: string;

  @IsString()
  front: string;

  @IsString()
  back: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class UpdateFlashcardDto {
  @IsString()
  @IsOptional()
  front?: string;

  @IsString()
  @IsOptional()
  back?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  deckId?: string;
}

// ==================== REVIEW DTOs ====================

export class SubmitReviewDto {
  @IsString()
  flashcardId: string;

  @IsInt()
  @Min(0)
  @Max(5)
  rating: number; // 0=Again, 3=Hard, 4=Good, 5=Easy
}
