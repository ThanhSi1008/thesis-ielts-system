import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  IsEnum,
  IsObject,
  Min,
  Max,
  MaxLength,
  MinLength,
  IsBoolean,
} from "class-validator";

// ==================== POST TYPE ENUM ====================

export enum PostType {
  STUDY_TIP = "STUDY_TIP",
  SCORE_ACHIEVEMENT = "SCORE_ACHIEVEMENT",
  GENERAL = "GENERAL",
}

// ==================== POST DTOs ====================

export class CreatePostDto {
  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  body: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ListPostsDto {
  @IsString()
  @IsOptional()
  cursor?: string; // Post ID — fetch posts older than this

  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;

  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  authorId?: string;

  @IsBoolean()
  @IsOptional()
  bookmarkedOnly?: boolean;
}

// ==================== COMMENT DTOs ====================

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body: string;

  @IsString()
  @IsOptional()
  parentId?: string; // null = top-level, non-null = reply
}
