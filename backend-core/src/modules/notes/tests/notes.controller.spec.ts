import { Test, TestingModule } from "@nestjs/testing";
import { NotesController } from "../notes.controller";
import { NotesService } from "../notes.service";
import { JwtAuthGuard } from "../../../modules/auth/guards/jwt-auth.guard";

describe("NotesController", () => {
  let controller: NotesController;
  let serviceMock: any;

  const USER_ID = "user-notes-111";
  const EXAM_ID = "exam-notes-222";
  const NOTE_ID = "note-uuid-333";

  beforeEach(async () => {
    serviceMock = {
      getExamNotes: jest.fn(),
      upsertNote: jest.fn(),
      deleteNote: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [{ provide: NotesService, useValue: serviceMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<NotesController>(NotesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getExamNotes", () => {
    it("should call service.getExamNotes with queries", async () => {
      serviceMock.getExamNotes.mockResolvedValue([]);

      const result = await controller.getExamNotes(USER_ID, EXAM_ID);

      expect(serviceMock.getExamNotes).toHaveBeenCalledWith(USER_ID, EXAM_ID);
      expect(result).toEqual([]);
    });
  });

  describe("upsertNote", () => {
    it("should call service.upsertNote with dto data", async () => {
      const dto = {
        userId: USER_ID,
        examId: EXAM_ID,
        questionNumber: 4,
        noteText: "Hello notes",
      };
      serviceMock.upsertNote.mockResolvedValue(dto);

      const result = await controller.upsertNote(dto);

      expect(serviceMock.upsertNote).toHaveBeenCalledWith(
        dto.userId,
        dto.examId,
        dto.questionNumber,
        dto.noteText,
      );
      expect(result).toEqual(dto);
    });
  });

  describe("deleteNote", () => {
    it("should call service.deleteNote with param id and request user id", async () => {
      const req = { user: { id: USER_ID } };
      serviceMock.deleteNote.mockResolvedValue({ id: NOTE_ID });

      const result = await controller.deleteNote(req, NOTE_ID);

      expect(serviceMock.deleteNote).toHaveBeenCalledWith(NOTE_ID, USER_ID);
      expect(result).toEqual({ id: NOTE_ID });
    });
  });
});
