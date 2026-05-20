import { Test, TestingModule } from "@nestjs/testing";
import { ShadowingProgressService } from "../services/shadowing-progress.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { GamificationService } from "../../gamification/gamification.service";

describe("ShadowingProgressService", () => {
  let service: ShadowingProgressService;
  let prismaMock: any;
  let gamificationServiceMock: any;

  const USER_ID = "user-shadowing-111";
  const LESSON_ID = "lesson-shadowing-222";

  beforeEach(async () => {
    prismaMock = {
      shadowingProgress: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
      shadowingVideo: {
        findUnique: jest.fn(),
      },
    };

    gamificationServiceMock = {
      onEvent: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShadowingProgressService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: GamificationService, useValue: gamificationServiceMock },
      ],
    }).compile();

    service = module.get<ShadowingProgressService>(ShadowingProgressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByLesson", () => {
    it("should return completedSentences or empty array if progress not found", async () => {
      prismaMock.shadowingProgress.findUnique.mockResolvedValue(null);

      const result = await service.findByLesson(USER_ID, LESSON_ID);

      expect(prismaMock.shadowingProgress.findUnique).toHaveBeenCalledWith({
        where: { userId_lessonId: { userId: USER_ID, lessonId: LESSON_ID } },
      });
      expect(result).toEqual({ completedSentences: [] });
    });

    it("should return completedSentences if progress exists in DB", async () => {
      prismaMock.shadowingProgress.findUnique.mockResolvedValue({
        completedSentences: [0, 1],
      });

      const result = await service.findByLesson(USER_ID, LESSON_ID);

      expect(result).toEqual({ completedSentences: [0, 1] });
    });
  });

  describe("upsert", () => {
    it("should create progress, award sentence XP, and NOT award lesson complete if video sentences not matched", async () => {
      // Prior to this, progress has 0 completed sentences
      prismaMock.shadowingProgress.findUnique.mockResolvedValue(null);

      const mockProgress = {
        userId: USER_ID,
        lessonId: LESSON_ID,
        completedSentences: [0, 1],
      };
      prismaMock.shadowingProgress.upsert.mockResolvedValue(mockProgress);

      const dto = {
        lessonId: LESSON_ID,
        completedSentences: [0, 1],
      };

      const result = await service.upsert(USER_ID, dto);

      expect(prismaMock.shadowingProgress.upsert).toHaveBeenCalledWith({
        where: { userId_lessonId: { userId: USER_ID, lessonId: LESSON_ID } },
        create: {
          userId: USER_ID,
          lessonId: LESSON_ID,
          completedSentences: [0, 1],
        },
        update: {
          completedSentences: [0, 1],
        },
      });

      // Award sentence XP: 2 * (2 - 0) = 4 XP
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 4,
        reason: "SHADOWING_SENTENCE",
      });

      // Video lookup is checked
      expect(prismaMock.shadowingVideo.findUnique).toHaveBeenCalledWith({
        where: { id: LESSON_ID },
        select: { sentences: true },
      });

      expect(result).toEqual(mockProgress);
    });

    it("should complete shadowing video and award lesson completion achievements when all sentences matched", async () => {
      // Prior progress had 1 completed sentence
      prismaMock.shadowingProgress.findUnique.mockResolvedValue({
        completedSentences: [0],
      });

      const mockProgress = {
        userId: USER_ID,
        lessonId: LESSON_ID,
        completedSentences: [0, 1, 2],
      };
      prismaMock.shadowingProgress.upsert.mockResolvedValue(mockProgress);

      // The video actually has 3 sentences in total
      prismaMock.shadowingVideo.findUnique.mockResolvedValue({
        sentences: [{ id: 0 }, { id: 1 }, { id: 2 }],
      });

      const dto = {
        lessonId: LESSON_ID,
        completedSentences: [0, 1, 2],
      };

      const result = await service.upsert(USER_ID, dto);

      // 1. Sentence XP awarded: 2 * (3 - 1) = 4 XP
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 4,
        reason: "SHADOWING_SENTENCE",
      });

      // 2. Video completion achievements (completed count 3 >= sentences 3)
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 15,
        reason: "SHADOWING_LESSON_COMPLETE",
        achievementKeys: ["SH_ECHO", "SH_PARROT", "SH_VOICE_ACTOR"],
      });

      expect(result).toEqual(mockProgress);
    });

    it("should NOT trigger sentence XP if new completion count is not greater than existing count", async () => {
      // Prior progress had 2 completed sentences
      prismaMock.shadowingProgress.findUnique.mockResolvedValue({
        completedSentences: [0, 1],
      });

      const mockProgress = {
        userId: USER_ID,
        lessonId: LESSON_ID,
        completedSentences: [0], // For some reason, fewer sentences (or same) completed
      };
      prismaMock.shadowingProgress.upsert.mockResolvedValue(mockProgress);

      const dto = {
        lessonId: LESSON_ID,
        completedSentences: [0],
      };

      await service.upsert(USER_ID, dto);

      // gamificationService.onEvent should not be called since newCount (1) <= existingCount (2)
      expect(gamificationServiceMock.onEvent).not.toHaveBeenCalled();
      expect(prismaMock.shadowingVideo.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("findAllByUser", () => {
    it("should return mapped shadowing progress by lesson ID", async () => {
      const mockRows = [
        { lessonId: "l1", completedSentences: [0] },
        { lessonId: "l2", completedSentences: [0, 1, 2] },
      ];
      prismaMock.shadowingProgress.findMany.mockResolvedValue(mockRows);

      const result = await service.findAllByUser(USER_ID);

      expect(prismaMock.shadowingProgress.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
      });
      expect(result).toEqual({
        l1: [0],
        l2: [0, 1, 2],
      });
    });
  });
});
