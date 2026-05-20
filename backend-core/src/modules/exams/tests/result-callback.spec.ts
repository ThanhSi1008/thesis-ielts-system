/**
 * TC_CB — Result Callback Endpoint (backend-ai → backend-core webhook)
 *
 * Endpoint under test (planned — not yet implemented in production controller):
 *   POST /api/v1/ielts/intensive/sessions/:id/result-callback
 *
 * Security: X-Callback-Signature header = HMAC-SHA256(JSON.stringify(body), CALLBACK_SECRET)
 *
 * Test strategy: inline stub controller.
 *   This spec defines an inline ResultCallbackController (mirrors the intended
 *   production implementation) and mounts it in an isolated NestJS app.
 *   Prisma is replaced by a jest mock object; the HMAC secret is injected via
 *   a custom provider token.
 *
 * TC_CB_01 — Callback hợp lệ → lưu result, set status GRADED → 200
 * TC_CB_02 — Callback với signature sai → 401 Unauthorized
 * TC_CB_03 — Callback cho session GRADING_FAILED → 200 idempotency (không ghi đè)
 * TC_CB_04 — Callback body thiếu required fields → 400
 */

import * as crypto from 'crypto';
import {
  Controller,
  Post,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  INestApplication,
  UnauthorizedException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNumber, IsObject, IsOptional } from 'class-validator';
import * as request from 'supertest';

// ─────────────────────────────────────────────────────────────────────────────
// Injection tokens
// ─────────────────────────────────────────────────────────────────────────────

const PRISMA_TOKEN = Symbol('TEST_PRISMA');
const SECRET_TOKEN = Symbol('TEST_CALLBACK_SECRET');

// ─────────────────────────────────────────────────────────────────────────────
// DTO — mirrors the production ResultCallbackDto that backend-ai will POST
// ─────────────────────────────────────────────────────────────────────────────

class ResultCallbackDto {
  @IsNumber()
  totalScore: number;

  @IsNumber()
  @IsOptional()
  writingScore?: number;

  @IsNumber()
  @IsOptional()
  speakingScore?: number;

  @IsNumber()
  @IsOptional()
  listeningScore?: number;

  @IsNumber()
  @IsOptional()
  readingScore?: number;

  @IsObject()
  feedback: Record<string, any>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline stub controller — mirrors the intended production implementation.
// When the real controller is added to IeltsModule / ExamsModule, these tests
// should be updated to import and use the real controller instead.
// ─────────────────────────────────────────────────────────────────────────────

@Controller('ielts/intensive/sessions')
class ResultCallbackController {
  constructor(
    @Inject(PRISMA_TOKEN) private readonly prisma: any,
    @Inject(SECRET_TOKEN) private readonly secret: string,
  ) {}

  @Post(':id/result-callback')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Param('id') sessionId: string,
    @Headers('x-callback-signature') signature: string,
    @Body() body: ResultCallbackDto,
  ) {
    // Verify HMAC-SHA256 — secret shared between backend-ai and backend-core
    const expected = crypto
      .createHmac('sha256', this.secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (!signature || signature !== expected) {
      throw new UnauthorizedException('Invalid callback signature');
    }

    const session = await this.prisma.ieltsIntensiveSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Idempotency: GRADING_FAILED sessions must not be overwritten by a late callback
    if (session.status === 'GRADING_FAILED') {
      return { ok: true, skipped: true };
    }

    // Persist grading result
    await this.prisma.ieltsIntensiveResult.upsert({
      where: { sessionId },
      create: {
        userId: session.userId,
        sessionId,
        totalScore: body.totalScore,
        writingScore: body.writingScore ?? null,
        speakingScore: body.speakingScore ?? null,
        listeningScore: body.listeningScore ?? null,
        readingScore: body.readingScore ?? null,
        feedback: body.feedback,
        gradedAt: new Date(),
      },
      update: {
        totalScore: body.totalScore,
        writingScore: body.writingScore ?? null,
        speakingScore: body.speakingScore ?? null,
        listeningScore: body.listeningScore ?? null,
        readingScore: body.readingScore ?? null,
        feedback: body.feedback,
        gradedAt: new Date(),
      },
    });

    // Transition session to GRADED
    await this.prisma.ieltsIntensiveSession.update({
      where: { id: sessionId },
      data: { status: 'GRADED' },
    });

    return { ok: true };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test constants
// ─────────────────────────────────────────────────────────────────────────────

const TEST_SECRET = 'test-callback-secret-value-for-ci';
const SESSION_GRADING = 'sess-grading-001';
const SESSION_FAILED = 'sess-grading-failed-002';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function computeSignature(body: object): string {
  return crypto
    .createHmac('sha256', TEST_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('ResultCallbackController — POST ielts/intensive/sessions/:id/result-callback (TC_CB)', () => {
  let app: INestApplication;

  const prismaMock = {
    ieltsIntensiveSession: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    ieltsIntensiveResult: {
      upsert: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [ResultCallbackController],
      providers: [
        { provide: PRISMA_TOKEN, useValue: prismaMock },
        { provide: SECRET_TOKEN, useValue: TEST_SECRET },
      ],
    }).compile();

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
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_CB_01 — Callback hợp lệ → lưu IeltsIntensiveResult, set GRADED → 200
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_CB_01: callback với signature đúng → lưu result, session.status = GRADED, 200 OK', async () => {
    const callbackBody = {
      totalScore: 6.5,
      writingScore: 6.5,
      feedback: { taskAchievement: 'Good', coherence: 'Adequate', lexical: 'Some errors' },
    };
    const sig = computeSignature(callbackBody);

    prismaMock.ieltsIntensiveSession.findUnique.mockResolvedValue({
      id: SESSION_GRADING,
      userId: 'user-001',
      status: 'GRADING',
    });
    prismaMock.ieltsIntensiveResult.upsert.mockResolvedValue({ id: 'result-001' });
    prismaMock.ieltsIntensiveSession.update.mockResolvedValue({
      id: SESSION_GRADING,
      status: 'GRADED',
    });

    const res = await request(app.getHttpServer())
      .post(`/api/v1/ielts/intensive/sessions/${SESSION_GRADING}/result-callback`)
      .set('x-callback-signature', sig)
      .send(callbackBody);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);

    // IeltsIntensiveResult phải được upsert với đúng score và feedback
    expect(prismaMock.ieltsIntensiveResult.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.ieltsIntensiveResult.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { sessionId: SESSION_GRADING },
        create: expect.objectContaining({
          userId: 'user-001',
          sessionId: SESSION_GRADING,
          totalScore: 6.5,
          writingScore: 6.5,
        }),
      }),
    );

    // Session phải được set status = GRADED
    expect(prismaMock.ieltsIntensiveSession.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.ieltsIntensiveSession.update).toHaveBeenCalledWith({
      where: { id: SESSION_GRADING },
      data: { status: 'GRADED' },
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_CB_02 — Callback với signature sai → 401 Unauthorized
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_CB_02: callback với signature sai → 401 Unauthorized, không ghi DB', async () => {
    const callbackBody = {
      totalScore: 7.0,
      feedback: { taskAchievement: 'Excellent' },
    };

    const res = await request(app.getHttpServer())
      .post(`/api/v1/ielts/intensive/sessions/${SESSION_GRADING}/result-callback`)
      .set('x-callback-signature', 'wrong-signature-value')
      .send(callbackBody);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid callback signature');
    expect(prismaMock.ieltsIntensiveSession.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.ieltsIntensiveResult.upsert).not.toHaveBeenCalled();
    expect(prismaMock.ieltsIntensiveSession.update).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_CB_03 — Callback cho session GRADING_FAILED → 200, không ghi đè result
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_CB_03: callback cho session GRADING_FAILED → 200 idempotency, result không bị ghi đè', async () => {
    const callbackBody = {
      totalScore: 5.5,
      feedback: { note: 'Retry result' },
    };
    const sig = computeSignature(callbackBody);

    prismaMock.ieltsIntensiveSession.findUnique.mockResolvedValue({
      id: SESSION_FAILED,
      userId: 'user-002',
      status: 'GRADING_FAILED',
    });

    const res = await request(app.getHttpServer())
      .post(`/api/v1/ielts/intensive/sessions/${SESSION_FAILED}/result-callback`)
      .set('x-callback-signature', sig)
      .send(callbackBody);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.skipped).toBe(true);

    // Không được ghi đè result khi session đã GRADING_FAILED
    expect(prismaMock.ieltsIntensiveResult.upsert).not.toHaveBeenCalled();
    expect(prismaMock.ieltsIntensiveSession.update).not.toHaveBeenCalled();
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TC_CB_04 — Callback body thiếu required fields → 400 ValidationError
  // ───────────────────────────────────────────────────────────────────────────

  it('TC_CB_04: callback body thiếu totalScore và feedback → 400 Bad Request', async () => {
    // Body missing required fields: totalScore and feedback
    const incompleteBody = { writingScore: 6.0 };
    const sig = computeSignature(incompleteBody);

    const res = await request(app.getHttpServer())
      .post(`/api/v1/ielts/intensive/sessions/any-session-id/result-callback`)
      .set('x-callback-signature', sig)
      .send(incompleteBody);

    expect(res.status).toBe(400);
    // ValidationPipe should report missing required fields
    expect(res.body).toHaveProperty('message');
    const messages: string[] = Array.isArray(res.body.message)
      ? res.body.message
      : [res.body.message];
    expect(messages.some((m) => m.includes('totalScore') || m.includes('feedback'))).toBe(true);

    expect(prismaMock.ieltsIntensiveSession.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.ieltsIntensiveResult.upsert).not.toHaveBeenCalled();
  });
});
