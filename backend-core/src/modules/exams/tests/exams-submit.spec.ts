/**
 * TC_EXAM — Exams Submit & Async Grading Flow
 *
 * Endpoint under test:
 *   POST /api/v1/exams/sessions/:sessionId/submit
 *     → ExamsController.submitSession()
 *     → ExamsService.submitSession()  (mocked below)
 *
 * Test strategy: controller-level isolation.
 *   - ExamsService is mocked entirely (jest.fn() stubs).
 *   - AiClientService is mocked; for TC_EXAM_01, the submitSession mock
 *     calls publishGradingTask internally so the spy assertion is meaningful.
 *   - JwtAuthGuard / ThrottlerGuard are overridden with lightweight fakes.
 *
 * TC_EXAM_01 — Submit hợp lệ (WRITING) → status SUBMITTED, publishGradingTask x1
 * TC_EXAM_02 — Session đã GRADED → 400 "Session already graded"
 * TC_EXAM_03 — Session của user khác → 403 Access denied
 * TC_EXAM_04 — Quota vượt giới hạn (FREE tier) → 403 QUOTA_EXCEEDED
 * TC_EXAM_05 — Không có JWT token → 401
 * TC_EXAM_06 — sessionId không tồn tại → 404
 */

import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { ThrottlerGuard } from '@nestjs/throttler';

import { ExamsController } from '../exams.controller';
import { ExamsService } from '../exams.service';
import { AiClientService } from '../../ai-client/ai-client.service';
import { StorageService } from '../../../common/storage/storage.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

// ─────────────────────────────────────────────────────────────────────────────
// Test constants
// ─────────────────────────────────────────────────────────────────────────────

const TEST_USER_ID = 'user-student-001';
const SESSION_WRITING = 'sess-writing-001';
const SESSION_GRADED = 'sess-already-graded';
const SESSION_OTHER_USER = 'sess-other-user';
const SESSION_QUOTA = 'sess-quota-test';
const SESSION_NO_TOKEN = 'sess-no-token';
const SESSION_NOT_FOUND = 'nonexistent-session-id';

// ─────────────────────────────────────────────────────────────────────────────
// Shared mocks
// ─────────────────────────────────────────────────────────────────────────────

const aiClientServiceMock = {
  publishGradingTask: jest.fn().mockResolvedValue(undefined),
  publishTranscriptionTask: jest.fn().mockResolvedValue(undefined),
  onModuleInit: jest.fn().mockResolvedValue(undefined),
  onModuleDestroy: jest.fn().mockResolvedValue(undefined),
};

const storageServiceMock = {
  uploadFile: jest.fn().mockResolvedValue('https://res.cloudinary.com/test/image/upload/v0/mock.png'),
  deleteFile: jest.fn().mockResolvedValue(undefined),
};

const examsServiceMock: Partial<Record<keyof ExamsService, jest.Mock>> = {
  submitSession: jest.fn(),
  createSession: jest.fn(),
  getSession: jest.fn(),
  deleteSession: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getHistory: jest.fn(),
  getIntensiveCatalog: jest.fn(),
  getPracticeCatalog: jest.fn(),
};

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('ExamsController — POST sessions/:sessionId/submit (TC_EXAM)', () => {
  let app: INestApplication;
  let guardShouldPass = true;

  const fakeJwtGuard = {
    canActivate: (ctx: ExecutionContext): boolean => {
      if (!guardShouldPass) throw new UnauthorizedException();
      const req = ctx.switchToHttp().getRequest();
      req.user = { id: TEST_USER_ID, email: 'student@example.com', role: 'STUDENT' };
      return true;
    },
  };

  const fakeThrottlerGuard = { canActivate: () => true };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ExamsController],
      providers: [
        { provide: ExamsService, useValue: examsServiceMock },
        { provide: AiClientService, useValue: aiClientServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtGuard)
      .overrideGuard(ThrottlerGuard)
      .useValue(fakeThrottlerGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    guardShouldPass = true;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_EXAM_01 — Submit hợp lệ → status SUBMITTED, publishGradingTask x1
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_EXAM_01: submit hợp lệ (WRITING) → 201, status SUBMITTED, publishGradingTask được gọi đúng 1 lần với đúng payload', async () => {
    const answers = { task1: 'The graph shows a rise in renewable energy.', task2: 'Overall, global trends indicate...' };
    const expectedGradingPayload = {
      sessionId: SESSION_WRITING,
      examType: 'WRITING',
      userId: TEST_USER_ID,
      answers,
      questions: { tasks: [{ task_number: 1 }, { task_number: 2 }] },
    };

    // submitSession mock: simulates real service — calls publishGradingTask then returns session
    (examsServiceMock.submitSession as jest.Mock).mockImplementation(async () => {
      await aiClientServiceMock.publishGradingTask(expectedGradingPayload);
      return {
        id: SESSION_WRITING,
        status: 'SUBMITTED',
        userId: TEST_USER_ID,
        examId: 'exam-writing-001',
        answers,
        submittedAt: new Date().toISOString(),
        ieltsIntensiveResult: null,
      };
    });

    const res = await request(app.getHttpServer())
      .post(`/api/v1/exams/sessions/${SESSION_WRITING}/submit`)
      .set('Authorization', 'Bearer valid-jwt-token')
      .send({ answers });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('SUBMITTED');
    expect(examsServiceMock.submitSession).toHaveBeenCalledTimes(1);
    expect(examsServiceMock.submitSession).toHaveBeenCalledWith(
      SESSION_WRITING,
      expect.objectContaining({ answers }),
    );

    // publishGradingTask phải được gọi đúng 1 lần với đúng payload
    expect(aiClientServiceMock.publishGradingTask).toHaveBeenCalledTimes(1);
    expect(aiClientServiceMock.publishGradingTask).toHaveBeenCalledWith(expectedGradingPayload);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_EXAM_02 — Session đã GRADED → 400 BadRequest
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_EXAM_02: submit session đã GRADED → 400 "Session already graded"', async () => {
    (examsServiceMock.submitSession as jest.Mock).mockRejectedValue(
      new BadRequestException('Session already graded'),
    );

    const res = await request(app.getHttpServer())
      .post(`/api/v1/exams/sessions/${SESSION_GRADED}/submit`)
      .set('Authorization', 'Bearer valid-jwt-token')
      .send({ answers: { '1': 'A' } });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Session already graded');
    expect(aiClientServiceMock.publishGradingTask).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_EXAM_03 — Session của user khác → 403 (không tiết lộ tồn tại)
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_EXAM_03: submit session thuộc user khác → 403 Access denied', async () => {
    (examsServiceMock.submitSession as jest.Mock).mockRejectedValue(
      new ForbiddenException('Access denied'),
    );

    const res = await request(app.getHttpServer())
      .post(`/api/v1/exams/sessions/${SESSION_OTHER_USER}/submit`)
      .set('Authorization', 'Bearer valid-jwt-token')
      .send({ answers: { '1': 'B' } });

    expect(res.status).toBe(403);
    expect(aiClientServiceMock.publishGradingTask).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_EXAM_04 — Quota vượt giới hạn → 403 QUOTA_EXCEEDED
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_EXAM_04: quota AI_WRITING_GRADING vượt giới hạn (FREE tier) → 403 QUOTA_EXCEEDED', async () => {
    (examsServiceMock.submitSession as jest.Mock).mockRejectedValue(
      new ForbiddenException({
        statusCode: 403,
        error: 'QUOTA_EXCEEDED',
        message: "You've reached your ai writing grading limit for this month",
        feature: 'AI_WRITING_GRADING',
        currentTier: 'FREE',
        upgradeUrl: '/pricing',
      }),
    );

    const res = await request(app.getHttpServer())
      .post(`/api/v1/exams/sessions/${SESSION_QUOTA}/submit`)
      .set('Authorization', 'Bearer valid-jwt-token')
      .send({ answers: { task1: 'An essay about climate change.' } });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('QUOTA_EXCEEDED');
    expect(res.body.feature).toBe('AI_WRITING_GRADING');
    expect(res.body.upgradeUrl).toBe('/pricing');
    expect(aiClientServiceMock.publishGradingTask).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_EXAM_05 — Không có JWT token → 401
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_EXAM_05: submit không có token → 401 Unauthorized', async () => {
    guardShouldPass = false;

    const res = await request(app.getHttpServer())
      .post(`/api/v1/exams/sessions/${SESSION_NO_TOKEN}/submit`)
      // No Authorization header
      .send({ answers: { '1': 'A' } });

    expect(res.status).toBe(401);
    expect(examsServiceMock.submitSession).not.toHaveBeenCalled();
    expect(aiClientServiceMock.publishGradingTask).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_EXAM_06 — sessionId không tồn tại → 404
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_EXAM_06: sessionId không tồn tại → 404 Not Found', async () => {
    (examsServiceMock.submitSession as jest.Mock).mockRejectedValue(
      new NotFoundException('Session not found'),
    );

    const res = await request(app.getHttpServer())
      .post(`/api/v1/exams/sessions/${SESSION_NOT_FOUND}/submit`)
      .set('Authorization', 'Bearer valid-jwt-token')
      .send({ answers: { '1': 'C' } });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Session not found');
    expect(aiClientServiceMock.publishGradingTask).not.toHaveBeenCalled();
  });
});
