import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { PronunciationService } from "../pronunciation.service";
import { PrismaService } from "@common/prisma/prisma.service";
import { RedisService } from "@common/redis/redis.service";
import { NotificationsService } from "../../notifications/notifications.service";
import { GamificationService } from "../../gamification/gamification.service";

describe("PronunciationService", () => {
  let service: PronunciationService;
  let prismaMock: any;
  let redisMock: any;
  let notificationsMock: any;
  let gamificationServiceMock: any;

  const USER_ID = "user-pron-111";
  const SOUND_ID = "sound-pron-222";
  const ATTEMPT_ID = "attempt-pron-333";

  beforeEach(async () => {
    prismaMock = {
      foundationPronunciationSound: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      foundationPronunciationProgress: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      foundationPronunciationAttempt: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    redisMock = {
      getJson: jest.fn(),
      setJson: jest.fn(),
      delByPattern: jest.fn(),
    };

    notificationsMock = {
      create: jest.fn(),
    };

    gamificationServiceMock = {
      onEvent: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PronunciationService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: RedisService, useValue: redisMock },
        { provide: NotificationsService, useValue: notificationsMock },
        { provide: GamificationService, useValue: gamificationServiceMock },
      ],
    }).compile();

    service = module.get<PronunciationService>(PronunciationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Read Operations & Caching", () => {
    it("getAllSounds - should read from Redis cache if available", async () => {
      const mockCached = { monophthongs: [{ id: "1", symbol: "/i:/" }] };
      redisMock.getJson.mockResolvedValue(mockCached);

      const result = await service.getAllSounds();

      expect(redisMock.getJson).toHaveBeenCalledWith("pronunciation:sounds");
      expect(prismaMock.foundationPronunciationSound.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(mockCached);
    });

    it("getAllSounds - should query DB and write to cache if cache is empty", async () => {
      redisMock.getJson.mockResolvedValue(null);

      const mockSounds = [
        { id: "1", symbol: "/i:/", type: "monophthong", exampleWords: [] },
        { id: "2", symbol: "/æ/", type: "monophthong", exampleWords: [] },
        { id: "3", symbol: "/aɪ/", type: "diphthong", exampleWords: [] },
        { id: "4", symbol: "/p/", type: "consonant", exampleWords: [] },
      ];
      prismaMock.foundationPronunciationSound.findMany.mockResolvedValue(mockSounds);

      const result = await service.getAllSounds();

      expect(prismaMock.foundationPronunciationSound.findMany).toHaveBeenCalledWith({
        orderBy: [{ type: "asc" }, { order: "asc" }],
        include: { exampleWords: { orderBy: { order: "asc" } } },
      });
      expect(redisMock.setJson).toHaveBeenCalledWith(
        "pronunciation:sounds",
        {
          monophthongs: [mockSounds[0], mockSounds[1]],
          diphthongs: [mockSounds[2]],
          consonants: [mockSounds[3]],
        },
        3600,
      );
      expect(result).toEqual({
        monophthongs: [mockSounds[0], mockSounds[1]],
        diphthongs: [mockSounds[2]],
        consonants: [mockSounds[3]],
      });
    });

    it("getSoundBySymbol - should return cached sound symbol if exists", async () => {
      const cachedSound = { id: SOUND_ID, symbol: "/i:/" };
      redisMock.getJson.mockResolvedValue(cachedSound);

      const result = await service.getSoundBySymbol("i:");

      expect(redisMock.getJson).toHaveBeenCalledWith("pronunciation:sound:i:");
      expect(prismaMock.foundationPronunciationSound.findUnique).not.toHaveBeenCalled();
      expect(result).toEqual(cachedSound);
    });

    it("getSoundBySymbol - should query DB and cache if cache miss", async () => {
      redisMock.getJson.mockResolvedValue(null);
      const mockSound = { id: SOUND_ID, symbol: "/i:/", exampleWords: [] };
      prismaMock.foundationPronunciationSound.findUnique.mockResolvedValue(mockSound);

      const result = await service.getSoundBySymbol("i:");

      expect(prismaMock.foundationPronunciationSound.findUnique).toHaveBeenCalledWith({
        where: { symbol: "i:" },
        include: { exampleWords: { orderBy: { order: "asc" } } },
      });
      expect(redisMock.setJson).toHaveBeenCalledWith("pronunciation:sound:i:", mockSound, 3600);
      expect(result).toEqual(mockSound);
    });
  });

  describe("Sound CRUD & Cache Invalidation", () => {
    it("createSound - should save sound and invalidate cache", async () => {
      const payload = { symbol: "/θ/", type: "consonant" };
      prismaMock.foundationPronunciationSound.create.mockResolvedValue({ id: "new-sound", ...payload });

      const result = await service.createSound(payload as any);

      expect(prismaMock.foundationPronunciationSound.create).toHaveBeenCalledWith({ data: payload });
      expect(redisMock.delByPattern).toHaveBeenCalledWith("pronunciation:*");
      expect(result.id).toBe("new-sound");
    });

    it("updateSound - should update sound and invalidate cache", async () => {
      const payload = { symbol: "/ð/" };
      prismaMock.foundationPronunciationSound.update.mockResolvedValue({ id: SOUND_ID, ...payload });

      const result = await service.updateSound(SOUND_ID, payload as any);

      expect(prismaMock.foundationPronunciationSound.update).toHaveBeenCalledWith({
        where: { id: SOUND_ID },
        data: payload,
      });
      expect(redisMock.delByPattern).toHaveBeenCalledWith("pronunciation:*");
      expect(result.id).toBe(SOUND_ID);
    });

    it("deleteSound - should delete sound and invalidate cache", async () => {
      prismaMock.foundationPronunciationSound.delete.mockResolvedValue({ id: SOUND_ID });

      const result = await service.deleteSound(SOUND_ID);

      expect(prismaMock.foundationPronunciationSound.delete).toHaveBeenCalledWith({ where: { id: SOUND_ID } });
      expect(redisMock.delByPattern).toHaveBeenCalledWith("pronunciation:*");
      expect(result.message).toBe("Pronunciation sound deleted successfully");
    });
  });

  describe("User Progress & Stats", () => {
    it("getUserProgress - should fetch user progress and join with all sounds", async () => {
      redisMock.getJson.mockResolvedValue(null);
      const mockSounds = [
        { id: "s1", symbol: "/i:/", type: "monophthong" },
        { id: "s2", symbol: "/æ/", type: "monophthong" },
      ];
      const mockProgress = [
        { soundId: "s1", status: "MASTERED", bestScore: 92, lastPracticedAt: new Date("2026-01-01") },
      ];

      prismaMock.foundationPronunciationSound.findMany.mockResolvedValue(mockSounds);
      prismaMock.foundationPronunciationProgress.findMany.mockResolvedValue(mockProgress);

      const result = await service.getUserProgress(USER_ID);

      expect(result).toEqual([
        {
          soundId: "s1",
          symbol: "/i:/",
          type: "monophthong",
          status: "MASTERED",
          practiceCount: 0,
          bestScore: 92,
          lastPracticedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          soundId: "s2",
          symbol: "/æ/",
          type: "monophthong",
          status: "NEW",
          practiceCount: 0,
          bestScore: null,
          lastPracticedAt: null,
        },
      ]);
      expect(redisMock.setJson).toHaveBeenCalledWith(`pronunciation:progress:${USER_ID}`, expect.any(Array), 300);
    });

    it("getUserStats - should compute sound mastery metrics", async () => {
      const mockProgressList = [
        { status: "MASTERED" },
        { status: "MASTERED" },
        { status: "PRACTICING" },
        { status: "NEW" },
      ];
      // mock getUserProgress through redis or spies
      redisMock.getJson.mockResolvedValue(mockProgressList);

      const result = await service.getUserStats(USER_ID);

      expect(result).toEqual({
        totalSounds: 4,
        masteredCount: 2,
        practicingCount: 1,
        newCount: 1,
        overallMastery: 50,
      });
    });
  });

  describe("Word Progress", () => {
    it("getWordProgress - should fetch example words and evaluate mastery statuses based on attempts", async () => {
      const mockSound = {
        exampleWords: [{ word: "Sheep" }, { word: "Ship" }],
      };
      prismaMock.foundationPronunciationSound.findUnique.mockResolvedValue(mockSound);

      const mockAttempts = [
        { targetWord: "sheep", score: 85 }, // Mastered (>=80)
        { targetWord: "sheep", score: 70 },
        { targetWord: "ship", score: 75 }, // Practicing
      ];
      prismaMock.foundationPronunciationAttempt.findMany.mockResolvedValue(mockAttempts);

      const result = await service.getWordProgress(USER_ID, SOUND_ID);

      expect(prismaMock.foundationPronunciationSound.findUnique).toHaveBeenCalledWith({
        where: { id: SOUND_ID },
        select: { exampleWords: { select: { word: true } } },
      });
      expect(prismaMock.foundationPronunciationAttempt.findMany).toHaveBeenCalledWith({
        where: {
          userId: USER_ID,
          targetWord: { in: ["sheep", "ship"] },
          status: "COMPLETED",
          score: { not: null },
        },
        select: { targetWord: true, score: true },
      });

      expect(result).toEqual([
        { word: "sheep", bestScore: 85, attemptCount: 2, status: "MASTERED" },
        { word: "ship", bestScore: 75, attemptCount: 1, status: "PRACTICING" },
      ]);
    });
  });

  describe("Progress & Attempt Updates", () => {
    it("updateProgress - should upsert progress record, invalidate cache and award gamification XP", async () => {
      const mockExisting = { status: "PRACTICING", bestScore: 75 };
      prismaMock.foundationPronunciationProgress.findUnique.mockResolvedValue(mockExisting);
      prismaMock.foundationPronunciationProgress.upsert.mockResolvedValue({ id: "p1", status: "MASTERED" });

      const result = await service.updateProgress(USER_ID, SOUND_ID, 85);

      expect(prismaMock.foundationPronunciationProgress.upsert).toHaveBeenCalledWith({
        where: { userId_soundId: { userId: USER_ID, soundId: SOUND_ID } },
        create: expect.objectContaining({
          userId: USER_ID,
          soundId: SOUND_ID,
          status: "MASTERED",
          bestScore: 85,
          practiceCount: 1,
        }),
        update: expect.objectContaining({
          status: "MASTERED",
          bestScore: { set: 85 },
          practiceCount: { increment: 1 },
        }),
      });

      expect(redisMock.delByPattern).toHaveBeenCalledWith(`pronunciation:progress:${USER_ID}`);
      expect(gamificationServiceMock.onEvent).toHaveBeenCalledWith(USER_ID, {
        xp: 5,
        reason: "PRONUNCIATION_PRACTICE",
        achievementKeys: ["FP_FIRST_SOUND"],
      });
      expect(gamificationServiceMock.onEvent).toHaveBeenLastCalledWith(USER_ID, {
        xp: 10,
        reason: "PRONUNCIATION_MASTERY",
        achievementKeys: ["FP_SHARP_EAR", "FP_NATIVE"],
      });
    });

    it("createPronunciationAttempt - should create progress record in PENDING state", async () => {
      prismaMock.foundationPronunciationAttempt.create.mockResolvedValue({ id: ATTEMPT_ID });

      const payload = {
        userId: USER_ID,
        vocabularyId: "vocab-111",
        audioUrl: "http://audio/pron",
        targetWord: "hello",
      };

      const result = await service.createPronunciationAttempt(payload);

      expect(prismaMock.foundationPronunciationAttempt.create).toHaveBeenCalledWith({
        data: {
          ...payload,
          status: "PENDING",
        },
      });
      expect(result.id).toBe(ATTEMPT_ID);
    });

    it("updatePronunciationAttempt - should update details", async () => {
      prismaMock.foundationPronunciationAttempt.update.mockResolvedValue({ id: ATTEMPT_ID });

      await service.updatePronunciationAttempt(ATTEMPT_ID, {
        transcribedText: "hello",
        score: 85,
        status: "COMPLETED",
      });

      expect(prismaMock.foundationPronunciationAttempt.update).toHaveBeenCalledWith({
        where: { id: ATTEMPT_ID },
        data: {
          transcribedText: "hello",
          score: 85,
          feedback: undefined,
          status: "COMPLETED",
        },
      });
    });
  });
});
