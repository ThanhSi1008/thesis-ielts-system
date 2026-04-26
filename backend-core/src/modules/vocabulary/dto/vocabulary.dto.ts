import { IsString, IsInt, IsOptional, IsUrl, Min } from 'class-validator';

export class CreateVocabularyBookDto {
  @IsString()
  name: string;

  @IsUrl()
  imageUrl: string;

  @IsInt()
  @Min(0)
  wordCount: number;

  @IsInt()
  @IsOptional()
  order?: number;
}

export class UpdateVocabularyBookDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  wordCount?: number;

  @IsInt()
  @IsOptional()
  order?: number;
}

export class CreateVocabularyUnitDto {
  @IsString()
  bookId: string;

  @IsString()
  title: string;

  @IsInt()
  order: number;

  @IsString()
  @IsOptional()
  storyTitle?: string;

  @IsString()
  @IsOptional()
  storyContent?: string;

  @IsUrl()
  @IsOptional()
  storyImageUrl?: string;
}

export class UpdateVocabularyUnitDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  storyTitle?: string;

  @IsString()
  @IsOptional()
  storyContent?: string;

  @IsUrl()
  @IsOptional()
  storyImageUrl?: string;
}

export class CreateVocabularyWordDto {
  @IsString()
  unitId: string;

  @IsString()
  word: string;

  @IsString()
  meaning: string;

  @IsString()
  @IsOptional()
  ipa?: string;

  @IsString()
  @IsOptional()
  partOfSpeech?: string;

  @IsString()
  @IsOptional()
  example?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}

export class UpdateVocabularyWordDto {
  @IsString()
  @IsOptional()
  word?: string;

  @IsString()
  @IsOptional()
  meaning?: string;

  @IsString()
  @IsOptional()
  ipa?: string;

  @IsString()
  @IsOptional()
  partOfSpeech?: string;

  @IsString()
  @IsOptional()
  example?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}
