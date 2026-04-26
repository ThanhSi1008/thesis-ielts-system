import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  Max,
  IsObject,
  IsBoolean,
} from "class-validator";

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
  cardTypeId?: string;

  @IsObject()
  @IsOptional()
  fieldValues?: Record<string, string>;

  @IsObject()
  @IsOptional()
  fieldStyles?: Record<string, object>; // Record<fieldId, FieldStyle>

  @IsObject()
  @IsOptional()
  cardStyle?: object; // CardStyle
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

  @IsObject()
  @IsOptional()
  fieldValues?: Record<string, string>;

  @IsObject()
  @IsOptional()
  fieldStyles?: Record<string, object>;

  @IsObject()
  @IsOptional()
  cardStyle?: object;
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

// ==================== CARD TYPE DTOs ====================

export class CreateCardTypeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class RenameCardTypeDto {
  @IsString()
  name: string;
}

export class UpdateCardTypeDescriptionDto {
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateCardTypeFieldDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fieldType?: string;
}

export class UpdateCardTypeFieldDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  fieldType?: string;
}

export class UpdateCardTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  frontFields?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  backFields?: string[];

  @IsObject()
  @IsOptional()
  fieldStyles?: Record<string, object>; // Record<fieldId, FieldStyle>

  @IsObject()
  @IsOptional()
  cardStyle?: object; // CardStyle
}
