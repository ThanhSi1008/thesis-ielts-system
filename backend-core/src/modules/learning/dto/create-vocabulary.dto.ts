import { IsString, IsOptional, IsUUID } from 'class-validator';

/**
 * DTO for adding vocabulary to a lesson
 */
export class CreateVocabularyDto {
  @IsUUID()
  lessonId: string;

  @IsString()
  word: string;

  @IsString()
  meaning: string;

  @IsOptional()
  @IsString()
  ipa?: string;

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  example?: string;

  @IsOptional()
  @IsString()
  partOfSpeech?: string;
}

