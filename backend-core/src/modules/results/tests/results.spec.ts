/**
 * TC_RES — Results Polling
 * GET /api/v1/results/session/:sessionId
 *
 * Spec-style tests (TDD) cho endpoint polling kết quả chấm thi.
 * Endpoint phải:
 *  1. Tra cứu session bằng sessionId (ieltsIntensiveSession.findUnique)
 *  2. Kiểm tra ownership: session.userId !== authUser.id → 404 (không lộ existence)
 *  3. Tra cứu result (ieltsIntensiveResult.findUnique where sessionId)
 *  4. Trả về { status, result, error } thay vì raw Prisma object
 *
 * Bảng fixture:
 *  OWNER_USER_ID = 'user-owner-001'   — user sở hữu session
 *  OTHER_USER_ID = 'user-other-002'   — user khác (TC_RES_03)
 *  SESSION_ID    = 'session-test-abc'
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';

import { ResultsController } from '../results.controller';
import { ResultsService } from '../results.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const SESSION_ID = 'session-test-abc';
const OWNER_USER_ID = 'user-owner-001';
const OTHER_USER_ID = 'user-other-002';

// ─────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────

const baseSession = {
  id: SESSION_ID,
  userId: OWNER_USER_ID,
  examId: 'exam-001',
  answers: {},
  timeTaken: null,
  practicePart: null,
  startedAt: new Date('2026-05-01T08:00:00Z'),
  submittedAt: new Date('2026-05-01T09:50:00Z'),
  createdAt: new Date('2026-05-01T08:00:00Z'),
  updatedAt: new Date('2026-05-01T09:50:00Z'),
};

/** Fixture: session đang GRADING — chưa có result */
const gradingSessionFixture = { ...baseSession, status: 'GRADING' };

/** Fixture: session GRADING_FAILED — chưa có result */
const gradingFailedSessionFixture = { ...baseSession, status: 'GRADING_FAILED' };

/** Fixture: session của user KHÁC (TC_RES_03) */
const otherUserSessionFixture = { ...baseSession, status: 'GRADED', userId: OTHER_USER_ID };

/** Fixture: full result khi session đã GRADED */
const gradedResultFixture = {
  id: 'result-001',
  userId: OWNER_USER_ID,
  sessionId: SESSION_ID,
  totalScore: 6.5,
  readingScore: 7,
  listeningScore: 7,
  speakingScore: 6.0,
  writingScore: 6.0,
  feedback: {
    overall: 'Good performance overall.',
    reading: 'Strong comprehension with minor errors.',
    listening: 'Accurate responses across all parts.',
    speaking: 'Fluent with occasional hesitations.',
    writing: 'Well-structured essay, minor grammar issues.',
  },
  gradedAt: new Date('2026-05-01T10:05:00Z'),
  createdAt: new Date('2026-05-01T10:05:00Z'),
  updatedAt: new Date('2026-05-01T10:05:00Z'),
  ieltsIntensiveSession: {
    ...baseSession,
    status: 'GRADED',
    ieltsIntensiveExam: { id: 'exam-001', title: 'IELTS Mock Test 1' },
  },
};

// ─────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────

describe('TC_RES — Results Polling', () => {
  let app: INestApplication;

  /** Flip false để giả lập request không có JWT */
  let guardShouldPass = true;
  /** UserId được inject vào req.user bởi fake guard */
  let currentUserId = OWNER_USER_ID;

  const fakeJwtGuard = {
    canActivate: (ctx: ExecutionContext) => {
      if (!guardShouldPass) throw new UnauthorizedException();
      const req = ctx.switchToHttp().getRequest();
      req.user = { id: currentUserId, email: 'tester@example.com', role: 'STUDENT' };
      return true;
    },
  };

  /** Prisma mock — chỉ khai báo các method mà ResultsService gọi */
  const prismaMock = {
    ieltsIntensiveSession: {
      findUnique: jest.fn(),
    },
    ieltsIntensiveResult: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ResultsController],
      providers: [
        ResultsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtGuard)
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
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
    currentUserId = OWNER_USER_ID;
  });

  // ─────────────────────────────────────────────────────────
  // [Auth]
  // ─────────────────────────────────────────────────────────

  describe('[Auth]', () => {
    it('TC_RES_05: Không có JWT token → 401 Unauthorized', async () => {
      guardShouldPass = false;

      const res = await request(app.getHttpServer())
        .get(`/api/v1/results/session/${SESSION_ID}`);

      expect(res.status).toBe(401);
      expect(prismaMock.ieltsIntensiveSession.findUnique).not.toHaveBeenCalled();
      expect(prismaMock.ieltsIntensiveResult.findUnique).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────
  // [NotFound / Security]
  // ─────────────────────────────────────────────────────────

  describe('[NotFound / Security]', () => {
    it('TC_RES_04: sessionId không tồn tại → 404', async () => {
      // Session không có trong DB
      prismaMock.ieltsIntensiveSession.findUnique.mockResolvedValue(null);
      prismaMock.ieltsIntensiveResult.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/api/v1/results/session/nonexistent-session-id');

      expect(res.status).toBe(404);
    });

    it('TC_RES_03: sessionId thuộc user khác → 404 (không tiết lộ existence)', async () => {
      // Session tồn tại nhưng userId KHÁC với người đang đăng nhập
      currentUserId = OWNER_USER_ID;
      prismaMock.ieltsIntensiveSession.findUnique.mockResolvedValue(otherUserSessionFixture);
      // Result cũng tồn tại nhưng ownership check phải chặn trước
      prismaMock.ieltsIntensiveResult.findUnique.mockResolvedValue({
        ...gradedResultFixture,
        userId: OTHER_USER_ID,
      });

      const res = await request(app.getHttpServer())
        .get(`/api/v1/results/session/${SESSION_ID}`);

      // Phải trả 404, KHÔNG phải 403 — tránh lộ session tồn tại
      expect(res.status).toBe(404);
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Valid]
  // ─────────────────────────────────────────────────────────

  describe('[Valid]', () => {
    it('TC_RES_01: Session đang GRADING → 200 { status: "GRADING", result: null }', async () => {
      prismaMock.ieltsIntensiveSession.findUnique.mockResolvedValue(gradingSessionFixture);
      // Chưa có result (AI chưa chấm xong)
      prismaMock.ieltsIntensiveResult.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/results/session/${SESSION_ID}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        status: 'GRADING',
        result: null,
      });
      expect(res.body).not.toHaveProperty('error');
    });

    it('TC_RES_02: Session đã GRADED → 200, full result shape', async () => {
      prismaMock.ieltsIntensiveSession.findUnique.mockResolvedValue({
        ...baseSession,
        status: 'GRADED',
      });
      prismaMock.ieltsIntensiveResult.findUnique.mockResolvedValue(gradedResultFixture);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/results/session/${SESSION_ID}`);

      expect(res.status).toBe(200);

      // Status-level assertion
      expect(res.body.status).toBe('GRADED');

      // Result shape phải chứa band (= totalScore) và feedback
      expect(res.body.result).toMatchObject({
        band: 6.5,
        feedback: {
          overall: expect.any(String),
          reading: expect.any(String),
          listening: expect.any(String),
          speaking: expect.any(String),
          writing: expect.any(String),
        },
      });

      // Skill scores
      expect(res.body.result).toMatchObject({
        readingScore: 7,
        listeningScore: 7,
        speakingScore: 6.0,
        writingScore: 6.0,
      });
    });

    it('TC_RES_06: Session GRADING_FAILED → 200 { status: "GRADING_FAILED", error: string }', async () => {
      prismaMock.ieltsIntensiveSession.findUnique.mockResolvedValue(gradingFailedSessionFixture);
      // Không có result khi chấm thất bại
      prismaMock.ieltsIntensiveResult.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/results/session/${SESSION_ID}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('GRADING_FAILED');
      // result phải là null, error phải là string mô tả lỗi
      expect(res.body.result).toBeNull();
      expect(typeof res.body.error).toBe('string');
      expect(res.body.error.length).toBeGreaterThan(0);
    });
  });
});
