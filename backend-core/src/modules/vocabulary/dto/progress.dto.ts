import { IsString, IsNumber, IsOptional, IsArray, Min, Max } from 'class-validator';

export class UpdateWordProgressDto {
  @IsString()
  unitId: string;

  @IsNumber()
  @Min(0)
  wordsLearned: number;
}

export class SubmitExerciseDto {
  @IsString()
  unitId: string;

  @IsArray()
  answers: { exerciseId: string; answer: string }[];
}

export class SubmitQuestionsDto {
  @IsString()
  unitId: string;

  @IsArray()
  answers: { questionId: string; answer: string }[];
}
