/**
 * TC11 — IELTS Statistics (IeltsStatisticsController)
 *
 * Endpoints test:
 *   - GET /api/v1/ielts-statistics/overview
 *   - GET /api/v1/ielts-statistics/foundation
 *   - GET /api/v1/ielts-statistics/basic
 *   - GET /api/v1/ielts-statistics/advanced
 *   - GET /api/v1/ielts-statistics/intensive
 *
 * Tất cả endpoint đều yêu cầu JWT (class-level @UseGuards(JwtAuthGuard)).
 *
 * Tham chiếu thesis: TC11 — "Lộ trình học tập" trong testing-sample.md.
 * Đây là controller phân tích kết quả phục vụ trang Dashboard / Statistics
 * của người học, vì vậy thuộc nhóm chức năng chính của module IELTS.
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';

import { IeltsStatisticsController } from '../ielts-statistics.controller';
import { IeltsStatisticsService } from '../ielts-statistics.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

describe('IeltsStatisticsController (TC11 — Thống kê IELTS)', () => {
  let app: INestApplication;
  const TEST_USER_ID = 'stats-user-001';
  let guardShouldPass = true;

  const fakeJwtGuard = {
    canActivate: (ctx: ExecutionContext) => {
      if (!guardShouldPass) throw new UnauthorizedException();
      const req = ctx.switchToHttp().getRequest();
      req.user = { id: TEST_USER_ID, email: 'stats@example.com', role: 'STUDENT' };
      return true;
    },
  };

  const serviceMock = {
    getOverviewStats: jest.fn(),
    getFoundationStats: jest.fn(),
    getBasicStats: jest.fn(),
    getAdvancedStats: jest.fn(),
    getIntensiveStats: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [IeltsStatisticsController],
      providers: [{ provide: IeltsStatisticsService, useValue: serviceMock }],
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
    guardShouldPass = true;
  });

  // ─────────────────────────────────────────────────────────
  // [Invalid] — auth missing
  // ─────────────────────────────────────────────────────────

  describe('[Invalid]', () => {
    it('TC11_01: GET /overview không có JWT → 401', async () => {
      guardShouldPass = false;
      const res = await request(app.getHttpServer())
        .get('/api/v1/ielts-statistics/overview');
      expect(res.status).toBe(401);
      expect(serviceMock.getOverviewStats).not.toHaveBeenCalled();
    });

    it('TC11_02: GET /foundation không có JWT → 401', async () => {
      guardShouldPass = false;
      const res = await request(app.getHttpServer())
        .get('/api/v1/ielts-statistics/foundation');
      expect(res.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Valid] — mỗi endpoint truyền userId hiện tại vào service
  // ─────────────────────────────────────────────────────────

  describe('[Valid]', () => {
    it('TC11_03: GET /overview → 200, service.getOverviewStats(userId) được gọi', async () => {
      const data = { totalLessons: 10, completed: 4, currentStreak: 3 };
      serviceMock.getOverviewStats.mockResolvedValue(data);

      const res = await request(app.getHttpServer())
        .get('/api/v1/ielts-statistics/overview');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(data);
      expect(serviceMock.getOverviewStats).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('TC11_04: GET /foundation → 200, đúng userId', async () => {
      serviceMock.getFoundationStats.mockResolvedValue({ vocabMastered: 100 });
      const res = await request(app.getHttpServer())
        .get('/api/v1/ielts-statistics/foundation');
      expect(res.status).toBe(200);
      expect(res.body.vocabMastered).toBe(100);
      expect(serviceMock.getFoundationStats).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('TC11_05: GET /basic → 200, đúng userId', async () => {
      serviceMock.getBasicStats.mockResolvedValue({ lessonsCompleted: 5 });
      const res = await request(app.getHttpServer())
        .get('/api/v1/ielts-statistics/basic');
      expect(res.status).toBe(200);
      expect(serviceMock.getBasicStats).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('TC11_06: GET /advanced → 200, đúng userId', async () => {
      serviceMock.getAdvancedStats.mockResolvedValue({ totalSessions: 12 });
      const res = await request(app.getHttpServer())
        .get('/api/v1/ielts-statistics/advanced');
      expect(res.status).toBe(200);
      expect(serviceMock.getAdvancedStats).toHaveBeenCalledWith(TEST_USER_ID);
    });

    it('TC11_07: GET /intensive → 200, đúng userId', async () => {
      serviceMock.getIntensiveStats.mockResolvedValue({ mockTests: 3, avgBand: 6.5 });
      const res = await request(app.getHttpServer())
        .get('/api/v1/ielts-statistics/intensive');
      expect(res.status).toBe(200);
      expect(res.body.avgBand).toBe(6.5);
      expect(serviceMock.getIntensiveStats).toHaveBeenCalledWith(TEST_USER_ID);
    });
  });
});
