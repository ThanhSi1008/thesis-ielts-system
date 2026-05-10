import { IsString, IsArray, IsOptional } from "class-validator";

export class AdminUpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  youtubeVideoId?: string;

  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  folder?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsArray()
  @IsOptional()
  sentences?: any[];

  @IsString()
  @IsOptional()
  status?: string;
}
