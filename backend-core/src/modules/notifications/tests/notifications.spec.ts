/**
 * TC05 — Thông báo (NotificationsController)
 *
 * Endpoints test:
 *   - GET    /api/v1/notifications              (paginated list)
 *   - GET    /api/v1/notifications/unread-count
 *   - PATCH  /api/v1/notifications/:id/read     (mark single as read)
 *   - PATCH  /api/v1/notifications/read-all     (mark all as read)
 *   - DELETE /api/v1/notifications/:id
 *
 * Tham chiếu thesis: TC05 trong testing-sample.md (Bảng 4.1).
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';

import { NotificationsController } from '../notifications.controller';
import { NotificationsService } from '../notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../../common/prisma/prisma.service';

describe('NotificationsController (TC05 — Thông báo)', () => {
  let app: INestApplication;
  const TEST_USER_ID = 'notif-user-001';
  let guardShouldPass = true;

  const fakeJwtGuard = {
    canActivate: (ctx: ExecutionContext) => {
      if (!guardShouldPass) throw new UnauthorizedException();
      const req = ctx.switchToHttp().getRequest();
      req.user = { id: TEST_USER_ID, email: 'notif@example.com', role: 'STUDENT' };
      return true;
    },
  };

  const prismaMock: any = {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: { findMany: jest.fn() },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        NotificationsService,
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
    guardShouldPass = true;
  });

  // ─────────────────────────────────────────────────────────
  // [Invalid] — auth & pagination edge cases
  // ─────────────────────────────────────────────────────────

  describe('[Invalid]', () => {
    it('TC05_01: không có JWT → 401', async () => {
      guardShouldPass = false;
      const res = await request(app.getHttpServer()).get('/api/v1/notifications');
      expect(res.status).toBe(401);
    });

    it('TC05_02: GET /unread-count không có JWT → 401', async () => {
      guardShouldPass = false;
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications/unread-count');
      expect(res.status).toBe(401);
    });

    it('TC05_03: DELETE /:id không có JWT → 401', async () => {
      guardShouldPass = false;
      const res = await request(app.getHttpServer())
        .delete('/api/v1/notifications/notif-x')
        .send();
      expect(res.status).toBe(401);
      expect(prismaMock.notification.deleteMany).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Valid] — list / unread-count / mark read / delete
  // ─────────────────────────────────────────────────────────

  describe('[Valid]', () => {
    it('TC05_04: GET /notifications → 200, trả danh sách + tổng, sắp xếp desc theo createdAt', async () => {
      const fakeNotifs = [
        { id: 'n1', userId: TEST_USER_ID, title: 'A', body: 'aa', isRead: false, createdAt: new Date('2026-05-15') },
        { id: 'n2', userId: TEST_USER_ID, title: 'B', body: 'bb', isRead: true, createdAt: new Date('2026-05-14') },
      ];
      prismaMock.notification.findMany.mockResolvedValue(fakeNotifs);
      prismaMock.notification.count.mockResolvedValue(2);

      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .query({ page: 1, limit: 20 });

      expect(res.status).toBe(200);
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: TEST_USER_ID },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('TC05_05: GET /notifications phân trang đúng page=2 → skip=20', async () => {
      prismaMock.notification.findMany.mockResolvedValue([]);
      prismaMock.notification.count.mockResolvedValue(0);

      await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .query({ page: 2, limit: 20 });

      const callArg = prismaMock.notification.findMany.mock.calls[0][0];
      expect(callArg.skip).toBe(20);
      expect(callArg.take).toBe(20);
    });

    it('TC05_06: PATCH /:id/read → 200, chỉ update notification thuộc về user (where: { id, userId })', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 1 });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/notifications/notif-123/read')
        .send();

      expect(res.status).toBe(200);
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-123', userId: TEST_USER_ID },
        data: { isRead: true },
      });
    });

    it('TC05_07: PATCH /:id/read trên notification của user khác → updateMany trả count: 0 (không lộ thông tin)', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 0 });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/notifications/foreign-notif/read')
        .send();

      // Endpoint vẫn 200 vì updateMany không throw — nhưng count = 0
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
    });

    it('TC05_08: PATCH /read-all → mark hết notification chưa đọc của user', async () => {
      prismaMock.notification.updateMany.mockResolvedValue({ count: 5 });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/notifications/read-all')
        .send();

      expect(res.status).toBe(200);
      expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: TEST_USER_ID, isRead: false },
        data: { isRead: true },
      });
    });

    it('TC05_09: DELETE /:id → 200, xoá notification thuộc user', async () => {
      prismaMock.notification.deleteMany.mockResolvedValue({ count: 1 });

      const res = await request(app.getHttpServer())
        .delete('/api/v1/notifications/notif-del-1')
        .send();

      expect(res.status).toBe(200);
      expect(prismaMock.notification.deleteMany).toHaveBeenCalledWith({
        where: { id: 'notif-del-1', userId: TEST_USER_ID },
      });
    });
  });
});
