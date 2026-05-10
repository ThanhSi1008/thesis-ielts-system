import { IsString, IsUUID } from "class-validator";

/**
 * DTO for adding grammar to a foundationVocabLesson
 */
export class CreateGrammarDto {
  @IsUUID()
  lessonId: string;

  @IsString()
  title: string;

  @IsString()
  rule: string;

  @IsString()
  example: string;
}
