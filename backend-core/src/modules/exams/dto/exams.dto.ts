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
  answers: Record<string, string | number>;
}
