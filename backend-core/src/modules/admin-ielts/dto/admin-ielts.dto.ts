import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsObject,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
} from "class-validator";
import {
  ContentImportTargetSystem,
  ContentImportSkill,
  ContentImportSourceType,
} from "@prisma/client";

export class CreateImportJobDto {
  @IsEnum(ContentImportTargetSystem)
  @IsNotEmpty()
  targetSystem: ContentImportTargetSystem;

  @IsEnum(ContentImportSkill)
  @IsNotEmpty()
  skill: ContentImportSkill;

  @IsEnum(ContentImportSourceType)
  @IsNotEmpty()
  sourceType: ContentImportSourceType;

  @IsString()
  @IsNotEmpty()
  sourceRef: string;

  @IsObject()
  @IsNotEmpty()
  provenance: {
    source: string;
    bookNumber?: number;
    testNumber?: number;
    quarter?: string;
    year?: number;
    title?: string;
    [key: string]: any;
  };

  @IsArray()
  @IsOptional()
  mediaAssets?: Array<any>;
}

export class SaveDraftDto {
  @IsObject()
  @IsNotEmpty()
  structuredJson: Record<string, any>;

  @IsObject()
  @IsOptional()
  provenance?: Record<string, any>;

  @IsArray()
  @IsOptional()
  mediaAssets?: Array<any>;

  @IsInt()
  @Min(0)
  version: number;
}

export class CallbackExtractedDto {
  @IsObject()
  @IsOptional()
  structuredJson?: Record<string, any>;

  @IsArray()
  @IsOptional()
  mediaAssets?: Array<{
    originalUrl: string;
    storedUrl: string;
    kind: string;
    bytes?: number;
  }>;

  @IsString()
  @IsOptional()
  geminiModel?: string;

  @IsInt()
  @IsOptional()
  tokensUsed?: number;

  @IsString()
  @IsOptional()
  error?: string;
}

export class CommitJobDto {
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsBoolean()
  @IsOptional()
  overwrite?: boolean;
}
