import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsObject,
  IsNotEmpty,
  IsEnum,
  Min,
  Max,
  Allow,
} from 'class-validator';
import { ExamType, Difficulty } from '@prisma/client';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ExamType)
  @IsNotEmpty()
  type: ExamType;

  @IsEnum(Difficulty)
  @IsNotEmpty()
  difficulty: Difficulty;

  @IsNumber()
  @Min(1)
  duration: number; // in minutes

  @IsObject()
  @IsNotEmpty()
  questions: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class UpdateExamDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(990)
  @IsOptional()
  targetScore?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class SubmitSessionDto {
  @IsObject()
  @IsNotEmpty()
  @Allow()
  answers: Record<string, string | number>;

  @IsNumber()
  @IsOptional()
  timeTaken?: number;
}

export class WritingResultCallbackDto {
  @IsNumber()
  overallBand: number;

  @IsNumber()
  task1Band: number;

  @IsNumber()
  task2Band: number;

  @IsObject()
  feedback: Record<string, any>;
}
