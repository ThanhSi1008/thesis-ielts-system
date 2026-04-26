import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, Min } from 'class-validator';

enum Difficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

/**
 * DTO for creating a new lesson
 */
export class CreateLessonDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(Difficulty)
  difficulty: Difficulty;

  @IsInt()
  @Min(0)
  order: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

