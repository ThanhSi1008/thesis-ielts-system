import { IsString, IsArray, IsOptional, IsNotEmpty, IsNumber } from "class-validator";
import { ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ShadowingSentenceDto {
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

export class CreateShadowingVideoDto {
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
  @Type(() => ShadowingSentenceDto)
  sentences: ShadowingSentenceDto[];
}
