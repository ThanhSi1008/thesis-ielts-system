import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class UpsertNoteDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  examId: string;

  @IsNumber()
  questionNumber: number;

  @IsString()
  noteText: string;
}
