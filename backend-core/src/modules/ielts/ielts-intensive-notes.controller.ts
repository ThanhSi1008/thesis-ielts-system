import { Body, Controller, Delete, Get, Param, Put, Query, UseGuards } from "@nestjs/common";
import { IeltsIntensiveService } from "./ielts-intensive.service";
import { UpsertNoteDto } from "./dto/ielts-intensive-notes.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("notes")
@UseGuards(JwtAuthGuard)
export class IeltsIntensiveNotesController {
  constructor(private readonly intensiveService: IeltsIntensiveService) {}

  @Get()
  getExamNotes(
    @Query("userId") userId: string,
    @Query("examId") examId: string,
  ) {
    return this.intensiveService.getExamNotes(userId, examId);
  }

  @Put()
  upsertNote(@Body() dto: UpsertNoteDto) {
    return this.intensiveService.upsertNote(
      dto.userId,
      dto.examId,
      dto.questionNumber,
      dto.noteText,
    );
  }

  @Delete(":id")
  deleteNote(@Param("id") id: string) {
    return this.intensiveService.deleteNote(id);
  }
}
