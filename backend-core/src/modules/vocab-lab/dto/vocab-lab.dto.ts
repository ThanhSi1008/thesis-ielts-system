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
  audioUrl?: string; // TTS-generated pronunciation audio URL (set by the AI agent)

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

export class CreateFlashcardFromVocabWithReviewDto {
  @IsString()
  bookName: string;

  @IsObject()
  word: any;

  @IsInt()
  @Min(1)
  @Max(4)
  rating: number; // 1=Again, 2=Hard, 3=Good, 4=Easy
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

// ==================== IMPORT/EXPORT DTOs ====================

export class ImportDeckDto {
  @IsInt()
  version: number;

  @IsString()
  exportedAt: string;

  @IsObject()
  deck: { name: string };

  @IsObject()
  @IsOptional()
  cardType: {
    name: string;
    description?: string | null;
    fields: Array<{ name: string; order: number; fieldType: string }>;
    templates: Array<{
      name: string;
      frontFieldNames: string[];
      backFieldNames: string[];
      fieldStyles?: Record<string, any>;
      cardStyle?: any;
    }>;
  } | null;

  @IsArray()
  cards: Array<{
    fieldValues: Record<string, string>;
    tags?: string[];
    fieldStyles?: Record<string, any> | null;
    cardStyle?: any | null;
  }>;
}

export class PublishDeckDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

export class BrowseSharedDecksDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sort?: 'popular' | 'newest';

  @IsString()
  @IsOptional()
  category?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  publisherId?: string;
}
