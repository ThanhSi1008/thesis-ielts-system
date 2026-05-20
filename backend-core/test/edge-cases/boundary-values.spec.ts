/**
 * TC_BOUND — Boundary Value Tests
 *
 * Endpoints:
 *   - POST /api/v1/pronunciation/progress   (score boundary)
 *   - GET  /api/v1/ielts/statistics/foundation  (zero-data boundary)
 *   - POST /api/v1/posts                    (content & imageUrls boundary)
 *
 * TC_BOUND_01: score = 0   → 201 (lower boundary hợp lệ)
 * TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ)
 * TC_BOUND_03: score = 101 → 201 (HIỆN TẠI: DTO chỉ có @Min(0), không có @Max(100) → PASS)
 *              [TODO: thêm @Max(100) vào UpdateProgressDto để giới hạn đúng]
 * TC_BOUND_04: score = -1  → 400 (under @Min(0) → ValidationPipe reject)
 * TC_BOUND_05: foundation stats khi user chưa học gì → 200 { vocabulary: { wordsLearned: 0 } }
 * TC_BOUND_06: POST /posts với content = '' → 400 (@MinLength(1))
 * TC_BOUND_07: POST /posts với imageUrls = [] → 201 (mảng rỗng hợp lệ)
 * TC_BOUND_08: POST /posts với imageUrls có 11 items → 201
 *              (HIỆN TẠI: DTO không có @ArrayMaxSize(10) → PASS)
 *              [TODO: thêm @ArrayMaxSize(10) vào CreatePostDto nếu cần giới hạn]
 *
 * Tham chiếu thesis: mục "Kiểm thử biên và giá trị ngoại lệ" (Bảng 4.2).
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';

// ── Pronunciation stack ──────────────────────────────────────────────────────
import { PronunciationController } from '../../src/modules/pronunciation/pronunciation.controller';
import { PronunciationService } from '../../src/modules/pronunciation/pronunciation.service';
import { StorageService } from '../../src/common/storage/storage.service';
import { AiClientService } from '../../src/modules/ai-client/ai-client.service';
import { UsageQuotaGuard } from '../../src/modules/subscriptions/guards/usage-quota.guard';

// ── IELTS statistics stack ────────────────────────────────────────────────────
import { IeltsStatisticsController } from '../../src/modules/ielts/ielts-statistics.controller';
import { IeltsStatisticsService } from '../../src/modules/ielts/ielts-statistics.service';

// ── Posts stack ──────────────────────────────────────────────────────────────
import { PostsController } from '../../src/modules/posts/posts.controller';
import { PostsService } from '../../src/modules/posts/posts.service';
import { GamificationService } from '../../src/modules/gamification/gamification.service';

// ── Shared guard ─────────────────────────────────────────────────────────────
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { PrismaService } from '../../src/common/prisma/prisma.service';

// ─────────────────────────────────────────────────────────────────────────────

describe('TC_EDGE — Pagination & Boundary Values', () => {
  // ══════════════════════════════════════════════════════════════════════════
  // BLOCK A: Pronunciation score boundary (TC_BOUND_01–04)
  // ══════════════════════════════════════════════════════════════════════════

  describe('POST /api/v1/pronunciation/progress — score boundary', () => {
    let app: INestApplication;
    const TEST_USER_ID = 'bound-pron-user-001';
    const VALID_SOUND_ID = 'sound-bound-001';

    const fakeJwtGuard = {
      canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: TEST_USER_ID, email: 'bound@example.com', role: 'STUDENT' };
        return true;
      },
    };

    const pronunciationServiceMock = {
      getAllSounds: jest.fn(),
      getSoundBySymbol: jest.fn(),
      getUserProgress: jest.fn(),
      getUserStats: jest.fn(),
      getWordProgress: jest.fn(),
      updateProgress: jest.fn(),
      createSound: jest.fn(),
      updateSound: jest.fn(),
      deleteSound: jest.fn(),
      createPronunciationAttempt: jest.fn(),
      updatePronunciationAttempt: jest.fn(),
      findUserPronunciationAttempts: jest.fn(),
    };

    const storageMock = { uploadFile: jest.fn(), deleteFile: jest.fn() };
    const aiClientMock = { publishPronunciationTask: jest.fn() };

    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [PronunciationController],
        providers: [
          { provide: PronunciationService, useValue: pronunciationServiceMock },
          { provide: StorageService, useValue: storageMock },
          { provide: AiClientService, useValue: aiClientMock },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(fakeJwtGuard)
        .overrideGuard(UsageQuotaGuard)
        .useValue({ canActivate: () => true })
        .compile();

      app = moduleRef.createNestApplication();
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    beforeEach(() => {
      jest.clearAllMocks();
      // Default: service trả về mock progress object
      pronunciationServiceMock.updateProgress.mockResolvedValue({
        userId: TEST_USER_ID,
        soundId: VALID_SOUND_ID,
        status: 'PRACTICING',
        bestScore: 0,
        practiceCount: 1,
      });
    });

    /**
     * TC_BOUND_01: score = 0 → 201 (lower boundary hợp lệ)
     * DTO @Min(0) cho phép giá trị 0.
     */
    it('TC_BOUND_01: score = 0 → 201 (lower boundary hợp lệ — @Min(0) pass)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/pronunciation/progress')
        .send({ soundId: VALID_SOUND_ID, score: 0 });

      expect(res.status).toBe(201);
      expect(pronunciationServiceMock.updateProgress).toHaveBeenCalledWith(
        TEST_USER_ID,
        VALID_SOUND_ID,
        0,
      );
    });

    /**
     * TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ)
     * 100 là điểm tối đa theo logic nghiệp vụ (MASTERY_THRESHOLD = 80).
     */
    it('TC_BOUND_02: score = 100 → 201 (upper boundary hợp lệ)', async () => {
      pronunciationServiceMock.updateProgress.mockResolvedValue({
        userId: TEST_USER_ID,
        soundId: VALID_SOUND_ID,
        status: 'MASTERED',
        bestScore: 100,
        practiceCount: 1,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/pronunciation/progress')
        .send({ soundId: VALID_SOUND_ID, score: 100 });

      expect(res.status).toBe(201);
      expect(pronunciationServiceMock.updateProgress).toHaveBeenCalledWith(
        TEST_USER_ID,
        VALID_SOUND_ID,
        100,
      );
    });

    /**
     * TC_BOUND_03: score = 101 → 201 (HIỆN TẠI — DTO thiếu @Max(100))
     *
     * NOTE: UpdateProgressDto chỉ có @IsInt() @Min(0), không có @Max(100).
     * Vì vậy giá trị 101 PASS qua ValidationPipe và service được gọi.
     *
     * [TODO]: Thêm @Max(100) vào UpdateProgressDto.score để đảm bảo đúng business rule.
     * Khi đó test này sẽ expect 400.
     */
    it('TC_BOUND_03: score = 101 → 201 (over max — HIỆN TẠI pass vì DTO thiếu @Max(100))', async () => {
      pronunciationServiceMock.updateProgress.mockResolvedValue({
        userId: TEST_USER_ID,
        soundId: VALID_SOUND_ID,
        status: 'MASTERED',
        bestScore: 101,
        practiceCount: 1,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/pronunciation/progress')
        .send({ soundId: VALID_SOUND_ID, score: 101 });

      // HIỆN TẠI: 201 vì không có @Max(100)
      // Khi thêm @Max(100) vào DTO → đổi thành toBe(400)
      expect(res.status).toBe(201);
    });

    /**
     * TC_BOUND_04: score = -1 → 400 (under @Min(0))
     * DTO có @Min(0) → ValidationPipe sẽ reject giá trị âm.
     */
    it('TC_BOUND_04: score = -1 → 400 (under @Min(0) — ValidationPipe reject)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/pronunciation/progress')
        .send({ soundId: VALID_SOUND_ID, score: -1 });

      expect(res.status).toBe(400);
      expect(pronunciationServiceMock.updateProgress).not.toHaveBeenCalled();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCK B: IELTS Statistics zero-data boundary (TC_BOUND_05)
  // ══════════════════════════════════════════════════════════════════════════

  describe('GET /api/v1/ielts-statistics/foundation — zero-data boundary', () => {
    let app: INestApplication;
    const TEST_USER_ID = 'bound-ielts-user-001';

    const fakeJwtGuard = {
      canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: TEST_USER_ID, email: 'ielts@example.com', role: 'STUDENT' };
        return true;
      },
    };

    // Mock toàn bộ Prisma để mô phỏng user chưa học gì
    const prismaMock: any = {
      foundationVocabProgress: {
        aggregate: jest.fn().mockResolvedValue({ _sum: { wordsLearned: null, totalWords: null } }),
      },
      foundationGrammarUnit: {
        count: jest.fn().mockResolvedValue(0),
      },
      foundationGrammarProgress: {
        count: jest.fn().mockResolvedValue(0),
      },
      foundationPronunciationProgress: {
        count: jest.fn().mockResolvedValue(0),
      },
    };

    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [IeltsStatisticsController],
        providers: [
          IeltsStatisticsService,
          { provide: PrismaService, useValue: prismaMock },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(fakeJwtGuard)
        .compile();

      app = moduleRef.createNestApplication();
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    beforeEach(() => {
      jest.clearAllMocks();
      // Reset mocks cho user chưa học gì
      prismaMock.foundationVocabProgress.aggregate.mockResolvedValue({
        _sum: { wordsLearned: null, totalWords: null },
      });
      prismaMock.foundationGrammarUnit.count.mockResolvedValue(0);
      prismaMock.foundationGrammarProgress.count.mockResolvedValue(0);
      prismaMock.foundationPronunciationProgress.count.mockResolvedValue(0);
    });

    /**
     * TC_BOUND_05: user chưa học gì → 200 với tất cả giá trị = 0, KHÔNG throw exception
     *
     * getFoundationStats() dùng || 0 để xử lý null từ aggregate._sum
     * → wordsLearned = 0, totalWords = 0, grammarCompleted = 0, etc.
     */
    it('TC_BOUND_05: GET /foundation khi user chưa học gì → 200 { vocabulary.wordsLearned: 0 } — KHÔNG throw', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/ielts-statistics/foundation');

      expect(res.status).toBe(200);

      // Vocabulary: không có data → wordsLearned = 0, totalWords = 0
      expect(res.body.vocabulary).toMatchObject({
        wordsLearned: 0,
        totalWords: 0,
      });

      // Grammar: không có unit, không có completed
      expect(res.body.grammar).toMatchObject({
        completedUnits: 0,
        totalUnits: 0,
      });

      // Pronunciation: tất cả = 0
      expect(res.body.pronunciation).toMatchObject({
        mastered: 0,
        practicing: 0,
        new: 0,
      });

      // Đảm bảo Prisma được query (không throw trước khi query)
      expect(prismaMock.foundationVocabProgress.aggregate).toHaveBeenCalled();
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCK C: Posts content & imageUrls boundary (TC_BOUND_06–08)
  // ══════════════════════════════════════════════════════════════════════════

  describe('POST /api/v1/posts — content & imageUrls boundary', () => {
    let app: INestApplication;
    const TEST_USER_ID = 'bound-post-user-001';

    const fakeJwtGuard = {
      canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: TEST_USER_ID, email: 'postbound@example.com', role: 'STUDENT' };
        return true;
      },
    };

    const prismaMock: any = {
      post: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      postLike: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
      postBookmark: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
      comment: { create: jest.fn() },
      $transaction: jest.fn(async (ops: any[]) => Promise.all(ops)),
    };

    const gamificationMock = {
      onEvent: jest.fn().mockResolvedValue(undefined),
    };

    const storageMock = {
      uploadFile: jest.fn().mockResolvedValue('https://cdn.test/x.png'),
      deleteFile: jest.fn(),
    };

    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [PostsController],
        providers: [
          PostsService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: GamificationService, useValue: gamificationMock },
          { provide: StorageService, useValue: storageMock },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(fakeJwtGuard)
        .compile();

      app = moduleRef.createNestApplication();
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    /**
     * Helper: tạo mock created post từ dto.
     */
    const mockCreatedPost = (overrides: Record<string, any> = {}) => ({
      id: 'post-bound-001',
      authorId: TEST_USER_ID,
      type: 'GENERAL',
      title: null,
      body: 'valid body',
      imageUrls: [],
      tags: [],
      metadata: null,
      likeCount: 0,
      isHidden: false,
      createdAt: new Date('2026-05-16'),
      author: {
        id: TEST_USER_ID,
        firstName: 'Bound',
        lastName: 'Test',
        avatar: null,
        subscription: null,
      },
      ...overrides,
    });

    /**
     * TC_BOUND_06: body = '' (empty string) → 400
     * CreatePostDto có @MinLength(1) trên field `body`.
     */
    it('TC_BOUND_06: POST /posts với body = "" → 400 (@MinLength(1) violation)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({ body: '' });

      expect(res.status).toBe(400);
      expect(prismaMock.post.create).not.toHaveBeenCalled();
      // Verify error message liên quan đến body validation
      expect(res.body.message).toBeDefined();
    });

    /**
     * TC_BOUND_07: imageUrls = [] (empty array) → 201
     * @IsArray() + @IsString({ each: true }) + @IsOptional() — mảng rỗng hợp lệ.
     */
    it('TC_BOUND_07: POST /posts với imageUrls = [] → 201 (mảng rỗng được phép)', async () => {
      prismaMock.post.create.mockResolvedValue(
        mockCreatedPost({ imageUrls: [] }),
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({ body: 'Post with empty imageUrls', imageUrls: [] });

      expect(res.status).toBe(201);
      expect(res.body.imageUrls).toEqual([]);
      expect(prismaMock.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ imageUrls: [] }),
        }),
      );
    });

    /**
     * TC_BOUND_08: imageUrls có 11 items → 201 (HIỆN TẠI — DTO thiếu @ArrayMaxSize(10))
     *
     * NOTE: CreatePostDto không có @ArrayMaxSize(10) trên imageUrls.
     * Vì vậy mảng 11 items PASS qua ValidationPipe.
     *
     * [TODO]: Thêm @ArrayMaxSize(10) vào CreatePostDto.imageUrls để giới hạn.
     * Khi đó test này sẽ expect 400.
     */
    it('TC_BOUND_08: POST /posts với imageUrls có 11 items → 201 (HIỆN TẠI pass vì thiếu @ArrayMaxSize(10))', async () => {
      const elevenUrls = Array.from(
        { length: 11 },
        (_, i) => `https://cdn.test/img-${i + 1}.png`,
      );

      prismaMock.post.create.mockResolvedValue(
        mockCreatedPost({ imageUrls: elevenUrls }),
      );

      const res = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({ body: 'Post with 11 images', imageUrls: elevenUrls });

      // HIỆN TẠI: 201 vì không có @ArrayMaxSize
      // Khi thêm @ArrayMaxSize(10) → đổi thành toBe(400)
      expect(res.status).toBe(201);
      expect(prismaMock.post.create).toHaveBeenCalled();
    });
  });
});
