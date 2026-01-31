import { IsUUID, IsString, IsOptional } from 'class-validator';

/**
 * DTO for pronunciation check request
 */
export class CheckPronunciationDto {
  @IsUUID()
  @IsOptional()
  vocabularyId?: string;

  @IsString()
  @IsOptional()
  targetWord?: string;

  @IsUUID()
  userId: string;
}

