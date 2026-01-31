import { IsString, IsInt, IsOptional, IsUrl, IsBoolean, Min } from 'class-validator';

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
