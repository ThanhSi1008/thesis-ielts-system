/**
 * TC10 — Luyện phát âm (PronunciationController)
 *
 * Endpoints test:
 *   - GET  /api/v1/pronunciation/sounds              (public)
 *   - GET  /api/v1/pronunciation/sounds/:symbol      (public — 404 nếu không có)
 *   - POST /api/v1/pronunciation/progress            (auth — ghi điểm phát âm)
 *   - POST /api/v1/pronunciation/sounds              (ADMIN only — RolesGuard)
 *
 * Tham chiếu thesis: TC10 trong testing-sample.md (Bảng 4.1)
 * — "Luyện nói: Ghi âm câu tiếng Anh → STT → AI phản hồi TTS → đánh giá phát âm".
 *
 * Test scope: routing + guards (JwtAuthGuard + RolesGuard). PronunciationService
 * được mock toàn bộ (mỗi method là một jest.fn) để cô lập logic IPA scoring.
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';

import { PronunciationController } from '../pronunciation.controller';
import { PronunciationService } from '../pronunciation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('PronunciationController (TC10 — Luyện phát âm)', () => {
  let app: INestApplication;
  let guardJwtPass = true;
  let userRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' = 'STUDENT';
  const TEST_USER_ID = 'pron-user-001';

  const fakeJwtGuard = {
    canActivate: (ctx: ExecutionContext) => {
      if (!guardJwtPass) throw new UnauthorizedException();
      const req = ctx.switchToHttp().getRequest();
      req.user = {
        id: TEST_USER_ID,
        email: 'pron@example.com',
        role: userRole,
      };
      return true;
    },
  };

  const serviceMock = {
    getAllSounds: jest.fn(),
    getSoundBySymbol: jest.fn(),
    getUserProgress: jest.fn(),
    getUserStats: jest.fn(),
    getWordProgress: jest.fn(),
    updateProgress: jest.fn(),
    createSound: jest.fn(),
    updateSound: jest.fn(),
    deleteSound: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PronunciationController],
      providers: [{ provide: PronunciationService, useValue: serviceMock }],
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
    guardJwtPass = true;
    userRole = 'STUDENT';
  });

  // ─────────────────────────────────────────────────────────
  // [Public endpoints]
  // ─────────────────────────────────────────────────────────

  describe('[Valid — public]', () => {
    it('TC10_01: GET /sounds → 200, trả mảng (public, không yêu cầu JWT)', async () => {
      const sounds = [
        { id: 's1', symbol: '/iː/', type: 'monophthong' },
        { id: 's2', symbol: '/æ/', type: 'monophthong' },
      ];
      serviceMock.getAllSounds.mockResolvedValue(sounds);

      // Tắt JWT để verify endpoint vẫn pass (chứng minh public)
      guardJwtPass = false;
      const res = await request(app.getHttpServer())
        .get('/api/v1/pronunciation/sounds');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(sounds);
      expect(serviceMock.getAllSounds).toHaveBeenCalledTimes(1);
    });

    it('TC10_02: GET /sounds/:symbol khi không tồn tại → 404 "Pronunciation sound not found"', async () => {
      serviceMock.getSoundBySymbol.mockResolvedValue(null);
      guardJwtPass = false;

      const res = await request(app.getHttpServer())
        .get('/api/v1/pronunciation/sounds/zzz');

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Pronunciation sound not found/i);
    });

    it('TC10_03: GET /sounds/:symbol có dữ liệu → 200, trả object sound', async () => {
      const sound = { id: 's1', symbol: '/iː/', type: 'monophthong', description: 'Long i' };
      serviceMock.getSoundBySymbol.mockResolvedValue(sound);
      guardJwtPass = false;

      const res = await request(app.getHttpServer())
        .get('/api/v1/pronunciation/sounds/i:');

      expect(res.status).toBe(200);
      expect(res.body.symbol).toBe('/iː/');
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Auth-required] POST /progress
  // ─────────────────────────────────────────────────────────

  describe('[Auth] POST /api/v1/pronunciation/progress', () => {
    it('TC10_04: không có JWT → 401', async () => {
      guardJwtPass = false;
      const res = await request(app.getHttpServer())
        .post('/api/v1/pronunciation/progress')
        .send({ soundId: 's1', score: 85 });

      expect(res.status).toBe(401);
      expect(serviceMock.updateProgress).not.toHaveBeenCalled();
    });

    it('TC10_05: payload hợp lệ → 201, service.updateProgress được gọi với (userId, soundId, score)', async () => {
      serviceMock.updateProgress.mockResolvedValue({
        userId: TEST_USER_ID,
        soundId: 's1',
        bestScore: 85,
        attempts: 1,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/pronunciation/progress')
        .send({ soundId: 's1', score: 85 });

      expect(res.status).toBe(201);
      expect(serviceMock.updateProgress).toHaveBeenCalledWith(
        TEST_USER_ID,
        's1',
        85,
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Admin-only] POST /sounds — RolesGuard
  // ─────────────────────────────────────────────────────────

  describe('[Admin] POST /api/v1/pronunciation/sounds', () => {
    it('TC10_06: user role = STUDENT → 403 (RolesGuard từ chối)', async () => {
      userRole = 'STUDENT';

      const res = await request(app.getHttpServer())
        .post('/api/v1/pronunciation/sounds')
        .send({ symbol: '/θ/', type: 'consonant', description: 'voiceless th' });

      expect(res.status).toBe(403);
      expect(serviceMock.createSound).not.toHaveBeenCalled();
    });

    it('TC10_07: user role = ADMIN → 201, service.createSound được gọi', async () => {
      userRole = 'ADMIN';
      const created = { id: 's-new', symbol: '/θ/', type: 'consonant' };
      serviceMock.createSound.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/api/v1/pronunciation/sounds')
        .send({ symbol: '/θ/', type: 'consonant', description: 'voiceless th' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('s-new');
      expect(serviceMock.createSound).toHaveBeenCalled();
    });
  });
});
