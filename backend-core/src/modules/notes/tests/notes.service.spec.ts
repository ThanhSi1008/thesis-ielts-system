import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { NotesService } from "../notes.service";
import { PrismaService } from "../../../common/prisma/prisma.service";

describe("NotesService", () => {
  let service: NotesService;
  let prismaMock: any;

  const USER_ID = "user-notes-111";
  const EXAM_ID = "exam-notes-222";
  const NOTE_ID = "note-uuid-333";

  beforeEach(async () => {
    prismaMock = {
      questionNote: {
        findMany: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getExamNotes", () => {
    it("should fetch exam notes ordered by questionNumber asc", async () => {
      const mockNotes = [
        { id: "1", userId: USER_ID, examId: EXAM_ID, questionNumber: 1, noteText: "Note 1" },
        { id: "2", userId: USER_ID, examId: EXAM_ID, questionNumber: 2, noteText: "Note 2" },
      ];
      prismaMock.questionNote.findMany.mockResolvedValue(mockNotes);

      const result = await service.getExamNotes(USER_ID, EXAM_ID);

      expect(prismaMock.questionNote.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID, examId: EXAM_ID },
        orderBy: { questionNumber: "asc" },
      });
      expect(result).toEqual(mockNotes);
    });
  });

  describe("upsertNote", () => {
    it("should upsert a note successfully", async () => {
      const mockNote = {
        id: NOTE_ID,
        userId: USER_ID,
        examId: EXAM_ID,
        questionNumber: 5,
        noteText: "Upserted Note Text",
      };
      prismaMock.questionNote.upsert.mockResolvedValue(mockNote);

      const result = await service.upsertNote(USER_ID, EXAM_ID, 5, "Upserted Note Text");

      expect(prismaMock.questionNote.upsert).toHaveBeenCalledWith({
        where: {
          userId_examId_questionNumber: {
            userId: USER_ID,
            examId: EXAM_ID,
            questionNumber: 5,
          },
        },
        update: { noteText: "Upserted Note Text" },
        create: {
          userId: USER_ID,
          examId: EXAM_ID,
          questionNumber: 5,
          noteText: "Upserted Note Text",
        },
      });
      expect(result).toEqual(mockNote);
    });
  });

  describe("deleteNote", () => {
    it("should throw NotFoundException if note to delete does not exist", async () => {
      prismaMock.questionNote.findMany.mockResolvedValue([]);

      await expect(service.deleteNote(NOTE_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaMock.questionNote.findMany).toHaveBeenCalledWith({
        where: { id: NOTE_ID, userId: USER_ID },
        take: 1,
      });
      expect(prismaMock.questionNote.delete).not.toHaveBeenCalled();
    });

    it("should delete the note if it exists", async () => {
      const mockNote = { id: NOTE_ID, userId: USER_ID };
      prismaMock.questionNote.findMany.mockResolvedValue([mockNote]);
      prismaMock.questionNote.delete.mockResolvedValue(mockNote);

      const result = await service.deleteNote(NOTE_ID, USER_ID);

      expect(prismaMock.questionNote.findMany).toHaveBeenCalledWith({
        where: { id: NOTE_ID, userId: USER_ID },
        take: 1,
      });
      expect(prismaMock.questionNote.delete).toHaveBeenCalledWith({
        where: { id: NOTE_ID },
      });
      expect(result).toEqual(mockNote);
    });
  });
});
