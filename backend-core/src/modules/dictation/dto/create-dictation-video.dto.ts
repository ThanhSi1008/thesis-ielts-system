import { IsString, IsArray, IsOptional, IsNotEmpty, IsNumber } from "class-validator";

export class DictationSentenceDto {
  @IsNumber()
  id: number;

  @IsString()
  english: string;

  @IsArray()
  @IsOptional()
  words?: string[];

  @IsNumber()
  audioStart: number;

  @IsNumber()
  audioEnd: number;
}

import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateDictationVideoDto {
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
  @Type(() => DictationSentenceDto)
  sentences: DictationSentenceDto[];
}
