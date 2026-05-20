import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { IeltsAdvancedService } from "../ielts-advanced.service";
import { PrismaService } from "../../../common/prisma/prisma.service";
import { StreakService } from "../streak.service";
import { GamificationService } from "../../gamification/gamification.service";
import { AiClientService } from "../../ai-client/ai-client.service";

describe("IeltsAdvancedService", () => {
  let service: IeltsAdvancedService;
  let prismaMock: any;
  let streakServiceMock: any;
  let gamificationServiceMock: any;
  let aiClientServiceMock: any;

  const USER_ID = "user-advanced-001";
  const PART_ID = "part-advanced-111";
  const SESSION_ID = "session-advanced-222";

  beforeEach(async () => {
    prismaMock = {
      ieltsAdvancedListeningPart: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      ieltsAdvancedListeningSession: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      ieltsAdvancedReadingPart: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      ieltsAdvancedReadingSession: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      ieltsAdvancedWritingPrompt: {
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        count: jest.fn(),
      },
      ieltsAdvancedWritingSession: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      ieltsAdvancedSpeakingPart: {
        findMany: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        count: jest.fn(),
      },
      ieltsAdvancedSpeakingSession: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
    };

    streakServiceMock = {
      recordActivity: jest.fn().mockResolvedValue(undefined),
    };

    gamificationServiceMock = {
      onEvent: jest.fn().mockResolvedValue(undefined),
    };

    aiClientServiceMock = {
      publishGradingTask: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IeltsAdvancedService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StreakService, useValue: streakServiceMock },
        { provide: GamificationService, useValue: gamificationServiceMock },
        { provide: AiClientService, useValue: aiClientServiceMock },
      ],
    }).compile();

    service = module.get<IeltsAdvancedService>(IeltsAdvancedService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Listening Parts & Submissions", () => {
    it("getListeningParts - should retrieve list sorted by part number", async () => {
      const mockParts = [
        { id: "1", title: "Part 1", partNumber: 1, questionTypes: ["MC"], createdAt: new Date() },
      ];
      prismaMock.ieltsAdvancedListeningPart.findMany.mockResolvedValue(mockParts);

      const result = await service.getListeningParts("MC");

      expect(prismaMock.ieltsAdvancedListeningPart.findMany).toHaveBeenCalledWith({
        where: { questionTypes: { has: "MC" } },
        orderBy: { partNumber: "asc" },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockParts);
    });

    it("getListeningPartDetail - should throw NotFoundException when part doesn't exist", async () => {
      prismaMock.ieltsAdvancedListeningPart.findUnique.mockResolvedValue(null);

      await expect(service.getListeningPartDetail(PART_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("submitListeningPart - should evaluate answers correctly across all formats and create session", async () => {
      const mockPart = {
        id: PART_ID,
        title: "Advanced Listening Part",
        partNumber: 1,
        content: [
          {
            type: "form_completion",
            points: [
              { question_number: "1", answer: "hello" },
              { question_number: "2", acceptable_answers: ["world", "earth"] },
            ],
          },
          {
            type: "matching",
            items: [{ id: "3" }, { id: "4" }],
            answers: {
              "3": { letter: "A" },
              "4": "B",
            },
          },
          {
            type: "multiple_choice_multiple",
            question_numbers: ["5", "6"],
            answers: ["X", "Y"],
          },
          {
            type: "table_completion",
            rows: [
              {
                questions: {
                  "7": { answer: "tableVal" },
                },
              },
            ],
          },
        ],
      };

      prismaMock.ieltsAdvancedListeningPart.findUnique.mockResolvedValue(mockPart);

      const userAnswers = {
        "1": "hello", // Correct
        "2": " EARTH ", // Correct (whitespace and case insensitive)
        "3": "a", // Correct (case insensitive matching letter)
        "4": "c", // Incorrect
        "mcm-2": "x, y", // MCM correct answers
        "7": "wrongval", // Incorrect table val
      };

      const mockSession = { id: SESSION_ID, userId: USER_ID };
      prismaMock.ieltsAdvancedListeningSession.create.mockResolvedValue(mockSession);

      const result = await service.submitListeningPart(USER_ID, PART_ID, { answers: userAnswers });

      expect(prismaMock.ieltsAdvancedListeningSession.create).toHaveBeenCalledWith({
        data: {
          userId: USER_ID,
          partId: PART_ID,
          answers: expect.any(Object),
          scoreData: {
            form_completion: { correct: 2, total: 2 },
            matching: { correct: 1, total: 2 },
            multiple_choice_multiple: { correct: 2, total: 2 },
            table_completion: { correct: 0, total: 1 },
          },
          totalScore: 5,
          totalQuestions: 7,
        },
      });

      expect(streakServiceMock.recordActivity).toHaveBeenCalledWith(USER_ID);
      // 5/7 is 71%, which is < 80% so only basic gamification is called
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 20,
        reason: "IELTS_ADVANCED_SUBMIT",
        achievementKeys: ["IA_LISTENER_5"],
      });
      expect(result).toEqual(mockSession);
    });

    it("submitListeningPart - should reward extra high-score XP if score >= 80%", async () => {
      const mockPart = {
        id: PART_ID,
        title: "Listening Part",
        content: [
          {
            type: "short_answer",
            questions: [{ question_number: "1", answer: "correct" }],
          },
        ],
      };

      prismaMock.ieltsAdvancedListeningPart.findUnique.mockResolvedValue(mockPart);
      prismaMock.ieltsAdvancedListeningSession.create.mockResolvedValue({});

      await service.submitListeningPart(USER_ID, PART_ID, { answers: { "1": "correct" } });

      // 1/1 = 100% which is >= 80% -> two gamification events called
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledTimes(2);
      expect(gamificationServiceMock.onEvent).toHaveBeenLastCalledWith(USER_ID, {
        xp: 10,
        reason: "IELTS_ADVANCED_HIGH_SCORE",
        achievementKeys: ["IA_HIGH_ACHIEVER"],
      });
    });
  });

  describe("Reading Parts & Submissions", () => {
    it("getReadingParts - should retrieve list sorted by part number", async () => {
      const mockParts = [{ id: "r1", title: "Reading 1", partNumber: 1 }];
      prismaMock.ieltsAdvancedReadingPart.findMany.mockResolvedValue(mockParts);

      const result = await service.getReadingParts();
      expect(result).toEqual(mockParts);
    });

    it("getReadingPartDetail - should throw NotFoundException if not exists", async () => {
      prismaMock.ieltsAdvancedReadingPart.findUnique.mockResolvedValue(null);
      await expect(service.getReadingPartDetail(PART_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("submitReadingPart - should evaluate answers correctly and award reading achievements", async () => {
      const mockPart = {
        id: PART_ID,
        title: "Reading Part",
        content: [
          {
            type: "matching",
            questions: [
              { question_number: "1", answer: "A" },
              { question_number: "2", acceptable_answers: ["B", "C"] },
            ],
          },
        ],
      };

      prismaMock.ieltsAdvancedReadingPart.findUnique.mockResolvedValue(mockPart);
      prismaMock.ieltsAdvancedReadingSession.create.mockResolvedValue({ id: SESSION_ID });

      const result = await service.submitReadingPart(USER_ID, PART_ID, {
        answers: { "1": "a", "2": "c" },
      });

      expect(prismaMock.ieltsAdvancedReadingSession.create).toHaveBeenCalledWith({
        data: {
          userId: USER_ID,
          partId: PART_ID,
          answers: { "1": "a", "2": "c" },
          scoreData: { matching: { correct: 2, total: 2 } },
          totalScore: 2,
          totalQuestions: 2,
        },
      });

      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 20,
        reason: "IELTS_ADVANCED_SUBMIT",
        achievementKeys: ["IA_READER_5"],
      });
      expect(gamificationServiceMock.onEvent).toHaveBeenLastCalledWith(USER_ID, {
        xp: 10,
        reason: "IELTS_ADVANCED_HIGH_SCORE",
        achievementKeys: ["IA_HIGH_ACHIEVER"],
      });
      expect(result.id).toBe(SESSION_ID);
    });
  });

  describe("Writing Session Lifecycle & Grading Orchestration", () => {
    it("getWritingPrompts - should return paginated list of prompts with best score mapping", async () => {
      const mockPrompts = [
        {
          id: "w1",
          title: "Prompt 1",
          sessions: [{ bandScore: 6.5, createdAt: new Date() }],
        },
      ];
      prismaMock.ieltsAdvancedWritingPrompt.findMany.mockResolvedValue(mockPrompts);
      prismaMock.ieltsAdvancedWritingPrompt.count.mockResolvedValue(1);

      const result = await service.getWritingPrompts(USER_ID, {
        page: 1,
        limit: 10,
      });

      expect(result.data[0].bestScore).toBe(6.5);
      expect(result.total).toBe(1);
    });

    it("getWritingPromptDetail - should fetch prompt details along with active session and history", async () => {
      const mockPrompt = { id: "w1", title: "Prompt" };
      const mockActive = { id: SESSION_ID, draftEssay: "Draft essay text" };

      prismaMock.ieltsAdvancedWritingPrompt.findUniqueOrThrow.mockResolvedValue(mockPrompt);
      prismaMock.ieltsAdvancedWritingSession.findFirst.mockResolvedValue(mockActive);

      const result = await service.getWritingPromptDetail(USER_ID, "w1");

      expect(result.activeSession).toEqual(mockActive);
    });

    it("createWritingSession - should return existing session if already in progress", async () => {
      const existingSession = { id: SESSION_ID, status: "IN_PROGRESS" };
      prismaMock.ieltsAdvancedWritingPrompt.findUniqueOrThrow.mockResolvedValue({});
      prismaMock.ieltsAdvancedWritingSession.findFirst.mockResolvedValue(existingSession);

      const result = await service.createWritingSession(USER_ID, "w1");

      expect(prismaMock.ieltsAdvancedWritingSession.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingSession);
    });

    it("createWritingSession - should create a new session if none is in progress", async () => {
      prismaMock.ieltsAdvancedWritingPrompt.findUniqueOrThrow.mockResolvedValue({});
      prismaMock.ieltsAdvancedWritingSession.findFirst.mockResolvedValue(null);
      prismaMock.ieltsAdvancedWritingSession.create.mockResolvedValue({ id: SESSION_ID });

      const result = await service.createWritingSession(USER_ID, "w1");

      expect(prismaMock.ieltsAdvancedWritingSession.create).toHaveBeenCalledWith({
        data: { userId: USER_ID, promptId: "w1" },
      });
      expect(result.id).toBe(SESSION_ID);
    });

    it("saveWritingDraft - should update draft for an active session", async () => {
      const mockSession = { id: SESSION_ID, status: "IN_PROGRESS" };
      prismaMock.ieltsAdvancedWritingSession.findFirst.mockResolvedValue(mockSession);
      prismaMock.ieltsAdvancedWritingSession.update.mockResolvedValue({ ...mockSession, draftEssay: "My draft" });

      const result = await service.saveWritingDraft(USER_ID, SESSION_ID, "My draft");

      expect(prismaMock.ieltsAdvancedWritingSession.update).toHaveBeenCalledWith({
        where: { id: SESSION_ID },
        data: { draftEssay: "My draft" },
      });
      expect(result.draftEssay).toBe("My draft");
    });

    it("saveWritingDraft - should throw NotFoundException if session is not active or doesn't exist", async () => {
      prismaMock.ieltsAdvancedWritingSession.findFirst.mockResolvedValue(null);

      await expect(
        service.saveWritingDraft(USER_ID, SESSION_ID, "My draft"),
      ).rejects.toThrow(NotFoundException);
    });

    it("submitWritingSession - should update status to GRADING and trigger AI RabbitMQ task", async () => {
      const mockSession = {
        id: SESSION_ID,
        userId: USER_ID,
        status: "IN_PROGRESS",
        prompt: {
          taskType: "TASK_1",
          prompt: "Write about graph",
          imageUrl: "http://cloudinary/image",
        },
      };

      prismaMock.ieltsAdvancedWritingSession.findFirst.mockResolvedValue(mockSession);
      prismaMock.ieltsAdvancedWritingSession.update.mockResolvedValue({
        ...mockSession,
        status: "GRADING",
      });

      const essay = "This is my IELTS writing essay...";
      const result = await service.submitWritingSession(USER_ID, SESSION_ID, essay, 1200);

      expect(prismaMock.ieltsAdvancedWritingSession.update).toHaveBeenCalledWith({
        where: { id: SESSION_ID },
        data: { essay, timeTaken: 1200, status: "GRADING" },
      });

      expect(aiClientServiceMock.publishGradingTask).toHaveBeenCalledWith({
        type: "ADVANCED_WRITING",
        sessionId: SESSION_ID,
        taskType: "TASK_1",
        prompt: "Write about graph",
        essay,
        imageUrl: "http://cloudinary/image",
      });

      expect(streakServiceMock.recordActivity).toHaveBeenCalledWith(USER_ID);
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 20,
        reason: "IELTS_ADVANCED_WRITING_SUBMIT",
        achievementKeys: ["ADV_WRITING_FIRST", "ADV_WRITING_10"],
      });
      expect(result.status).toBe("GRADING");
    });
  });

  describe("Speaking Session Lifecycle & Grading Orchestration", () => {
    it("createSpeakingSession - should create new session or return in-progress one", async () => {
      prismaMock.ieltsAdvancedSpeakingPart.findUniqueOrThrow.mockResolvedValue({});
      prismaMock.ieltsAdvancedSpeakingSession.findFirst.mockResolvedValue(null);
      prismaMock.ieltsAdvancedSpeakingSession.create.mockResolvedValue({ id: SESSION_ID });

      const result = await service.createSpeakingSession(USER_ID, "s1");

      expect(result.id).toBe(SESSION_ID);
    });

    it("submitSpeakingSession - should fail if no audio answers are provided", async () => {
      const mockSession = { id: SESSION_ID, status: "IN_PROGRESS" };
      prismaMock.ieltsAdvancedSpeakingSession.findFirst.mockResolvedValue(mockSession);

      await expect(
        service.submitSpeakingSession(USER_ID, SESSION_ID, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it("submitSpeakingSession - should submit speaking answers and publish AI task", async () => {
      const mockSession = {
        id: SESSION_ID,
        status: "IN_PROGRESS",
        part: {
          partNumber: 2,
          partType: "MONOLOGUE",
          questions: [{ text: "Describe a book you read" }],
        },
      };

      prismaMock.ieltsAdvancedSpeakingSession.findFirst.mockResolvedValue(mockSession);
      prismaMock.ieltsAdvancedSpeakingSession.update.mockResolvedValue({ id: SESSION_ID, status: "GRADING" });

      const audioAnswers = { "q1": "http://audio/url" };
      const result = await service.submitSpeakingSession(USER_ID, SESSION_ID, audioAnswers, 600);

      expect(prismaMock.ieltsAdvancedSpeakingSession.update).toHaveBeenCalledWith({
        where: { id: SESSION_ID },
        data: {
          audioUrls: audioAnswers as any,
          timeTaken: 600,
          status: "GRADING",
        },
      });

      expect(aiClientServiceMock.publishGradingTask).toHaveBeenCalledWith({
        type: "ADVANCED_SPEAKING",
        sessionId: SESSION_ID,
        partNumber: 2,
        partType: "MONOLOGUE",
        questions: ["Describe a book you read"],
        audioAnswers,
      });

      expect(streakServiceMock.recordActivity).toHaveBeenCalledWith(USER_ID);
      expect(result.status).toBe("GRADING");
    });
  });

  describe("History and Statistics Queries", () => {
    it("getStatistics - should aggregate correct scores over sessions", async () => {
      const mockSessions = [
        { scoreData: { MC: { correct: 4, total: 5 } } },
        { scoreData: { MC: { correct: 3, total: 5 }, matching: { correct: 2, total: 3 } } },
      ];
      prismaMock.ieltsAdvancedListeningSession.findMany.mockResolvedValue(mockSessions);

      const result = await service.getStatistics(USER_ID);

      expect(result).toEqual({
        MC: { correct: 7, total: 10, attempted: 10 },
        matching: { correct: 2, total: 3, attempted: 3 },
      });
    });

    it("getHistoryDetail - should retrieve listening session detail and enforce ownership", async () => {
      const mockSession = { id: SESSION_ID, userId: USER_ID, totalScore: 8 };
      prismaMock.ieltsAdvancedListeningSession.findUnique.mockResolvedValue(mockSession);

      const result = await service.getHistoryDetail(USER_ID, SESSION_ID);

      expect(result).toEqual(mockSession);
    });

    it("getHistoryDetail - should throw NotFoundException on wrong ownership", async () => {
      const mockSession = { id: SESSION_ID, userId: "another-user" };
      prismaMock.ieltsAdvancedListeningSession.findUnique.mockResolvedValue(mockSession);

      await expect(service.getHistoryDetail(USER_ID, SESSION_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
