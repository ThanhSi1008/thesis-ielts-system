import {
  IsString,
  IsInt,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsUUID,
  Min,
} from "class-validator";

export class CreatePronunciationSoundDto {
  @IsString()
  symbol: string;

  @IsString()
  type: string; // monophthong, diphthong, consonant

  @IsString()
  word: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @IsBoolean()
  @IsOptional()
  voiced?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdatePronunciationSoundDto {
  @IsString()
  @IsOptional()
  symbol?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  word?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @IsBoolean()
  @IsOptional()
  voiced?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

export class UpdateProgressDto {
  @IsString()
  soundId: string;

  @IsInt()
  @Min(0)
  score: number;
}

export class GetProgressResponseDto {
  soundId: string;
  symbol: string;
  status: 'NEW' | 'PRACTICING' | 'MASTERED';
  practiceCount: number;
  bestScore: number | null;
  lastPracticedAt: string | null;
}

export class PronunciationStatsDto {
  totalSounds: number;
  masteredCount: number;
  practicingCount: number;
  newCount: number;
  overallMastery: number;
}

export class WordProgressDto {
  word: string;
  bestScore: number | null;
  attemptCount: number;
  status: 'NEW' | 'PRACTICING' | 'MASTERED';
}

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
