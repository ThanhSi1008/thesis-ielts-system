import { IsUUID } from 'class-validator';

/**
 * DTO for pronunciation check request
 */
export class CheckPronunciationDto {
  @IsUUID()
  vocabularyId: string;

  @IsUUID()
  userId: string;
}

