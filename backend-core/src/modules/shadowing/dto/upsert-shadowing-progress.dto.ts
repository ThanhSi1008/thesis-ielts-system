import { IsString, IsArray, IsNotEmpty } from "class-validator";

export class UpsertShadowingProgressDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsArray()
  completedSentences: number[];
}
