/**
 * TC_EDGE — Pagination Edge Cases
 *
 * Endpoints:
 *   - GET /api/v1/notifications  (offset pagination: page / limit)
 *   - GET /api/v1/posts          (cursor pagination)
 *
 * TC_EDGE_01–06: it.each cho các query params bất thường trên notifications
 * TC_EDGE_07   : user không có notification nào → 200 { notifications: [], total: 0 }
 * TC_EDGE_08   : posts với cursor hợp lệ về format nhưng không tồn tại → 200 { items: [] }
 *
 * Tham chiếu thesis: mục "Kiểm thử biên và phân trang" (Bảng 4.2).
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';

// ── Notifications stack ──────────────────────────────────────────────────────
import { NotificationsController } from '../../src/modules/notifications/notifications.controller';
import { NotificationsService } from '../../src/modules/notifications/notifications.service';
import { PrismaService } from '../../src/common/prisma/prisma.service';

// ── Posts stack ──────────────────────────────────────────────────────────────
import { PostsController } from '../../src/modules/posts/posts.controller';
import { PostsService } from '../../src/modules/posts/posts.service';
import { StorageService } from '../../src/common/storage/storage.service';
import { GamificationService } from '../../src/modules/gamification/gamification.service';

// ── Shared guard ─────────────────────────────────────────────────────────────
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';

// ─────────────────────────────────────────────────────────────────────────────

describe('TC_EDGE — Pagination & Boundary Values', () => {
  // ══════════════════════════════════════════════════════════════════════════
  // BLOCK A: Notifications pagination edge cases (TC_EDGE_01–07)
  // ══════════════════════════════════════════════════════════════════════════

  describe('GET /api/v1/notifications — pagination edge cases', () => {
    let app: INestApplication;
    const TEST_USER_ID = 'edge-notif-user-001';
    let guardShouldPass = true;

    const fakeJwtGuard = {
      canActivate: (ctx: ExecutionContext) => {
        if (!guardShouldPass) throw new UnauthorizedException();
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: TEST_USER_ID, email: 'edge@example.com', role: 'STUDENT' };
        return true;
      },
    };

    const prismaMock: any = {
      notification: {
        findMany: jest.fn(),
        count: jest.fn(),
        updateMany: jest.fn(),
        deleteMany: jest.fn(),
        create: jest.fn(),
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
      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, transform: true }),
      );
      await app.init();
    });

    afterAll(async () => {
      await app.close();
    });

    beforeEach(() => {
      jest.clearAllMocks();
      guardShouldPass = true;
      // Default: Prisma trả về mảng rỗng và count = 0
      prismaMock.notification.findMany.mockResolvedValue([]);
      prismaMock.notification.count.mockResolvedValue(0);
    });

    // ── TC_EDGE_01–06: it.each ───────────────────────────────────────────────

    /**
     * Bảng test cases cho các query param bất thường.
     *
     * Cột: [testId, description, queryParams, expectedStatus]
     *
     * Ghi chú về implementation:
     * - NotificationsController dùng DefaultValuePipe(1) + ParseIntPipe cho page
     *   → page=0 vẫn parse thành 0 (không throw), service tính skip = (0-1)*limit = -20
     *   → NestJS chấp nhận, trả 200. (Nếu muốn validate ≥1, cần thêm @Min(1))
     * - page=-1: tương tự, ParseIntPipe không reject số âm → 200 (default behavior)
     * - limit=10000: không có cap trong controller hiện tại → 200 (service query với take=10000)
     * - cursor=not-a-valid-uuid: NotificationsController KHÔNG có query cursor, param này bị
     *   whitelist loại (hoặc bị bỏ qua) → 200
     * - không truyền gì: DefaultValuePipe kick in → page=1, limit=20 → 200
     * - limit=0: ParseIntPipe parse thành 0, không throw → 200 (service take=0)
     *
     * Các test này DOCUMENT hành vi thực tế của implementation hiện tại.
     * TODO: thêm validation @Min(1) @Max(100) vào controller nếu cần stricter behavior.
     */
    it.each([
      ['TC_EDGE_01', '?page=0 → default về page 1 (ParseInt không reject)', { page: 0 }, 200],
      ['TC_EDGE_02', '?page=-1 → 200 (ParseInt chấp nhận số âm, không có @Min)', { page: -1 }, 200],
      ['TC_EDGE_03', '?limit=10000 → 200 (không có cap maxLimit trong controller)', { limit: 10000 }, 200],
      ['TC_EDGE_04', '?cursor=not-a-valid-uuid → 200 (notifications không có cursor param)', { cursor: 'not-a-valid-uuid' }, 200],
      ['TC_EDGE_05', '(không truyền gì) → 200, DefaultValuePipe: page=1, limit=20', {}, 200],
      ['TC_EDGE_06', '?limit=0 → 200 (ParseInt chấp nhận 0, không có @Min(1))', { limit: 0 }, 200],
    ])('%s: %s', async (testId, _desc, queryParams, expectedStatus) => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .query(queryParams as Record<string, any>);

      expect(res.status).toBe(expectedStatus);
    });

    // ── TC_EDGE_07 ────────────────────────────────────────────────────────────

    it('TC_EDGE_07: user không có notification nào → 200 { notifications: [], total: 0 } (KHÔNG throw 404)', async () => {
      // Arrange: Prisma trả mảng rỗng (đã setup trong beforeEach)
      prismaMock.notification.findMany.mockResolvedValue([]);
      prismaMock.notification.count.mockResolvedValue(0);

      // Act
      const res = await request(app.getHttpServer())
        .get('/api/v1/notifications')
        .query({ page: 1, limit: 20 });

      // Assert: PHẢI là 200, không được 404
      expect(res.status).toBe(200);
      expect(res.body.notifications).toEqual([]);
      expect(res.body.total).toBe(0);
      // Verify Prisma được gọi đúng (where: { userId })
      expect(prismaMock.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: TEST_USER_ID },
        }),
      );
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // BLOCK B: Posts cursor pagination edge case (TC_EDGE_08)
  // ══════════════════════════════════════════════════════════════════════════

  describe('GET /api/v1/posts — cursor pagination edge case', () => {
    let app: INestApplication;
    const TEST_USER_ID = 'edge-post-user-001';

    const fakeJwtGuard = {
      canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: TEST_USER_ID, email: 'postuser@example.com', role: 'STUDENT' };
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
      postLike: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      postBookmark: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
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
     * TC_EDGE_08: cursor là UUID hợp lệ về format nhưng không tồn tại trong DB
     *
     * Behavior mong đợi:
     * - post.findUnique(cursor) → null (không tìm thấy cursor post)
     * - listPosts không thêm điều kiện createdAt (cursorCondition = undefined)
     * - post.findMany trả [] vì DB rỗng (mock)
     * - Kết quả: 200 { items: [], nextCursor: null }
     *
     * KHÔNG throw 404 — cursor không tìm thấy chỉ có nghĩa là không filter theo thời gian.
     */
    it('TC_EDGE_08: GET /api/v1/posts?cursor=<valid-uuid-nhưng-không-tồn-tại> → 200 { items: [] }', async () => {
      const nonExistentCursor = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

      // cursor post không tìm thấy
      prismaMock.post.findUnique.mockResolvedValue(null);
      // Không có post nào trong DB
      prismaMock.post.findMany.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get('/api/v1/posts')
        .query({ cursor: nonExistentCursor });

      expect(res.status).toBe(200);
      expect(res.body.items).toEqual([]);
      expect(res.body.nextCursor).toBeNull();

      // Verify: findUnique được gọi với cursor ID để resolve timestamp
      expect(prismaMock.post.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: nonExistentCursor },
        }),
      );
    });
  });
});
