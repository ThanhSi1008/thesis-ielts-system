import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';

export class UpsertProgressDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  type: string; // "shadowing" | "dictation"

  @IsArray()
  completedSentences: number[];

  @IsString()
  @IsOptional()
  dictationDifficulty?: string;
}
