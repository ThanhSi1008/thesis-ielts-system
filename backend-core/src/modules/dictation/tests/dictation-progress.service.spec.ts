import { Test, TestingModule } from "@nestjs/testing";
import { DictationProgressService } from "../services/dictation-progress.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { NotificationsService } from "../../notifications/notifications.service";
import { GamificationService } from "../../gamification/gamification.service";

describe("DictationProgressService", () => {
  let service: DictationProgressService;
  let prismaMock: any;
  let notificationsMock: any;
  let gamificationServiceMock: any;

  const USER_ID = "user-dictation-111";
  const LESSON_ID = "lesson-dictation-222";

  beforeEach(async () => {
    prismaMock = {
      dictationProgress: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    };

    notificationsMock = {
      notifyDictationComplete: jest.fn().mockResolvedValue(undefined),
    };

    gamificationServiceMock = {
      onEvent: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DictationProgressService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: NotificationsService, useValue: notificationsMock },
        { provide: GamificationService, useValue: gamificationServiceMock },
      ],
    }).compile();

    service = module.get<DictationProgressService>(DictationProgressService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findByLesson", () => {
    it("should return completedSentences array and difficulty, or defaults if not found", async () => {
      prismaMock.dictationProgress.findUnique.mockResolvedValue(null);

      const result = await service.findByLesson(USER_ID, LESSON_ID);

      expect(prismaMock.dictationProgress.findUnique).toHaveBeenCalledWith({
        where: { userId_lessonId: { userId: USER_ID, lessonId: LESSON_ID } },
      });
      expect(result).toEqual({
        completedSentences: [],
        difficulty: "Intermediate",
      });
    });

    it("should return completedSentences and difficulty from DB when row exists", async () => {
      prismaMock.dictationProgress.findUnique.mockResolvedValue({
        completedSentences: [0, 1, 2],
        difficulty: "Expert",
      });

      const result = await service.findByLesson(USER_ID, LESSON_ID);

      expect(result).toEqual({
        completedSentences: [0, 1, 2],
        difficulty: "Expert",
      });
    });
  });

  describe("upsert", () => {
    it("should create new progress, award sentence XP, but NOT complete lesson if sentences < total", async () => {
      const mockResult = {
        userId: USER_ID,
        lessonId: LESSON_ID,
        completedSentences: [0, 1],
        difficulty: "Intermediate",
      };

      prismaMock.dictationProgress.upsert.mockResolvedValue(mockResult);
      // Simulate that before this upsert, no existing progress existed
      prismaMock.dictationProgress.findUnique.mockResolvedValue(null);

      const dto = {
        lessonId: LESSON_ID,
        completedSentences: [0, 1],
        totalSentences: 5,
        lessonTitle: "Dictation Lesson 1",
      };

      const result = await service.upsert(USER_ID, dto);

      expect(prismaMock.dictationProgress.upsert).toHaveBeenCalledWith({
        where: { userId_lessonId: { userId: USER_ID, lessonId: LESSON_ID } },
        create: {
          userId: USER_ID,
          lessonId: LESSON_ID,
          completedSentences: [0, 1],
          difficulty: "Intermediate",
        },
        update: {
          completedSentences: [0, 1],
        },
      });

      // Assert sentence XP is awarded: 2 * (newCount - existingCount) = 2 * (2 - 0) = 4 XP
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 4,
        reason: "DICTATION_SENTENCE",
      });

      // Dictation complete notification & achievements should not be called since 2 < 5
      expect(notificationsMock.notifyDictationComplete).not.toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it("should transition lesson to complete, notify user, and award completion achievements", async () => {
      const mockResult = {
        userId: USER_ID,
        lessonId: LESSON_ID,
        completedSentences: [0, 1, 2],
        difficulty: "Expert",
      };

      prismaMock.dictationProgress.upsert.mockResolvedValue(mockResult);
      // Before this upsert, existing completed sentence count was 1
      prismaMock.dictationProgress.findUnique.mockResolvedValue({
        completedSentences: [0],
        difficulty: "Expert",
      });

      const dto = {
        lessonId: LESSON_ID,
        completedSentences: [0, 1, 2],
        totalSentences: 3,
        lessonTitle: "Dictation Lesson 1",
        difficulty: "Expert",
      };

      const result = await service.upsert(USER_ID, dto);

      // Sentences completed changed from 1 -> 3.
      // 1. Sentence XP awarded: 2 * (3 - 1) = 4 XP
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 4,
        reason: "DICTATION_SENTENCE",
      });

      // 2. Lesson completed newly (existing completed 1 < total 3, now completed 3 >= 3)
      expect(notificationsMock.notifyDictationComplete).toHaveBeenCalledWith(
        USER_ID,
        "Dictation Lesson 1",
        LESSON_ID,
      );

      // 3. Complete lesson achievements (Expert difficulty includes DI_EXPERT)
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 15,
        reason: "DICTATION_LESSON_COMPLETE",
        achievementKeys: ["DI_FIRST", "DI_REGULAR", "DI_EXPERT"],
      });

      expect(result).toEqual(mockResult);
    });

    it("should NOT trigger completion notifications if lesson was already completed", async () => {
      prismaMock.dictationProgress.upsert.mockResolvedValue({});
      // Before this upsert, lesson was already completed (completedSentences length 3 >= totalSentences 3)
      prismaMock.dictationProgress.findUnique.mockResolvedValue({
        completedSentences: [0, 1, 2],
        difficulty: "Expert",
      });

      const dto = {
        lessonId: LESSON_ID,
        completedSentences: [0, 1, 2],
        totalSentences: 3,
        lessonTitle: "Dictation Lesson 1",
      };

      await service.upsert(USER_ID, dto);

      expect(notificationsMock.notifyDictationComplete).not.toHaveBeenCalled();
      // Gamification COMPLETE event is not triggered again
      expect(gamificationServiceMock.onEvent).not.toHaveBeenCalled();
    });
  });

  describe("findAllByUser", () => {
    it("should return mapped dictation progress by lesson ID", async () => {
      const mockRows = [
        { lessonId: "l1", completedSentences: [0], difficulty: "Easy" },
        { lessonId: "l2", completedSentences: [0, 1], difficulty: "Expert" },
      ];
      prismaMock.dictationProgress.findMany.mockResolvedValue(mockRows);

      const result = await service.findAllByUser(USER_ID);

      expect(prismaMock.dictationProgress.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
      });
      expect(result).toEqual({
        l1: { completedSentences: [0], difficulty: "Easy" },
        l2: { completedSentences: [0, 1], difficulty: "Expert" },
      });
    });
  });
});
