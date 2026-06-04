import { IsString, IsArray, IsOptional, IsNotEmpty, IsNumber } from "class-validator";

export class UpsertDictationProgressDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsArray()
  completedSentences: number[];

  @IsString()
  @IsOptional()
  difficulty?: string; // "Beginner" | "Intermediate" | "Advanced" | "Expert"

  @IsString()
  @IsOptional()
  lessonTitle?: string;

  @IsNumber()
  @IsOptional()
  totalSentences?: number;
}

