import { IsString, IsArray, IsOptional, IsNotEmpty, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SentenceDto {
  @IsNumber()
  id: number;

  @IsString()
  english: string;

  @IsString()
  @IsOptional()
  phonetic?: string;

  @IsString()
  @IsOptional()
  vietnamese?: string;

  @IsArray()
  @IsOptional()
  words?: string[];

  @IsNumber()
  audioStart: number;

  @IsNumber()
  audioEnd: number;
}
export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  youtubeVideoId: string;

  @IsString()
  @IsOptional()
  folder?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SentenceDto)
  sentences: SentenceDto[];
}
