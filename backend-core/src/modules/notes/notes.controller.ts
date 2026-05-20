import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { NotesService } from "./notes.service";
import { IsString, IsNotEmpty, IsNumber } from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

class UpsertNoteDto {
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

@Controller("notes")
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  getExamNotes(
    @Query("userId") userId: string,
    @Query("examId") examId: string,
  ) {
    return this.notesService.getExamNotes(userId, examId);
  }

  @Put()
  upsertNote(@Body() dto: UpsertNoteDto) {
    return this.notesService.upsertNote(
      dto.userId,
      dto.examId,
      dto.questionNumber,
      dto.noteText,
    );
  }

  @Delete(":id")
  deleteNote(@Request() req: any, @Param("id") id: string) {
    return this.notesService.deleteNote(id, req.user.id);
  }
}
