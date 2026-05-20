/**
 * TC_SEC — Cross-user Data Access Security
 *
 * Kiểm tra tất cả endpoint có xử lý ownership đúng cách:
 *   - VocabLab decks : trả 404 khi không phải chủ sở hữu
 *   - Notes          : ghi nhận security gap (không có auth guard / ownership)
 *   - Posts          : trả 403 khi không phải tác giả; admin bypass trả 200
 *
 * File nằm ngoài rootDir: 'src' của jest.config.ts.
 * Chạy standalone từ backend-core/:
 *   npx jest --rootDir . test/security/cross-user-access.spec.ts
 *
 * Hai test được đánh dấu "SECURITY GAP" (TC_SEC_04, TC_SEC_08) dự kiến FAIL
 * cho đến khi implementation được vá — đây là hành vi có chủ ý, không phải lỗi.
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';

import { VocabLabController } from '../../src/modules/vocab-lab/vocab-lab.controller';
import { VocabLabService } from '../../src/modules/vocab-lab/vocab-lab.service';
import { NotesController } from '../../src/modules/notes/notes.controller';
import { NotesService } from '../../src/modules/notes/notes.service';
import { PostsController } from '../../src/modules/posts/posts.controller';
import { PostsService } from '../../src/modules/posts/posts.service';
import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { StorageService } from '../../src/common/storage/storage.service';
import { GamificationService } from '../../src/modules/gamification/gamification.service';
import { RedisService } from '../../src/common/redis/redis.service';
import { NotificationsService } from '../../src/modules/notifications/notifications.service';
import { SubscriptionsService } from '../../src/modules/subscriptions/subscriptions.service';

// ─────────────────────────────────────────────────────────────────────────────
// Shared fixtures
// ─────────────────────────────────────────────────────────────────────────────

/** userA = resource owner; userB = attacker (different STUDENT); adminUser = ADMIN role */
const userA = { id: 'user-a-001', email: 'usera@test.com', role: 'STUDENT' };
const userB = { id: 'user-b-002', email: 'userb@test.com', role: 'STUDENT' };
const adminUser = { id: 'admin-003', email: 'admin@test.com', role: 'ADMIN' };

const DECK_ID = 'deck-aaaa-0001';
const NOTE_ID = 'note-bbbb-0001';
const POST_ID = 'post-cccc-0001';

// ─────────────────────────────────────────────────────────────────────────────

describe('TC_SEC — Cross-user Data Access Security', () => {
  // ───────────────────────────────────────────────────────────────────────────
  // Nhóm 1 — VocabLab Ownership
  // ───────────────────────────────────────────────────────────────────────────

  describe('Nhóm 1 — VocabLab Ownership', () => {
    let app: INestApplication;
    let currentUser: Record<string, any>;

    const deckA = {
      id: DECK_ID,
      userId: userA.id,
      name: 'A deck',
      flashcards: [],
    };

    /**
     * Prisma mock: deck.findFirst trả deck chỉ khi where.userId === userA.id.
     * Khi userB gọi, where.userId = userB.id → null → NotFoundException → 404.
     */
    const prismaMock: any = {
      deck: {
        findFirst: jest.fn(),
        delete: jest.fn().mockResolvedValue(deckA),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      flashcard: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const redisMock = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      keys: jest.fn().mockResolvedValue([]),
    };
    const notifMock = { createNotification: jest.fn().mockResolvedValue(undefined) };
    const gamifMock = { onEvent: jest.fn().mockResolvedValue(undefined) };
    const subsMock = { getEffectiveTier: jest.fn().mockResolvedValue('FREE') };
    const storageMock = { uploadFile: jest.fn(), deleteFile: jest.fn() };

    /** Guard thay thế: inject currentUser vào req.user (không parse JWT thật). */
    const fakeJwtGuard = {
      canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().user = currentUser;
        return true;
      },
    };

    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [VocabLabController],
        providers: [
          VocabLabService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: RedisService, useValue: redisMock },
          { provide: NotificationsService, useValue: notifMock },
          { provide: GamificationService, useValue: gamifMock },
          { provide: SubscriptionsService, useValue: subsMock },
          { provide: StorageService, useValue: storageMock },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(fakeJwtGuard)
        .compile();

      app = moduleRef.createNestApplication();
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
      );
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    beforeEach(() => {
      jest.clearAllMocks();
      // Re-apply ownership-aware mock sau khi clearAllMocks xóa implementation.
      prismaMock.deck.findFirst.mockImplementation(({ where }: any) =>
        Promise.resolve(where?.userId === userA.id ? deckA : null),
      );
      currentUser = { ...userA };
    });

    it('TC_SEC_01: PATCH /api/v1/vocab-lab/decks/:id với token userB → 404', async () => {
      // PATCH /vocab-lab/decks/:id không được định nghĩa trong VocabLabController
      // (controller chỉ có DELETE và GET cho decks/:id). Route not found → 404.
      // Hệ quả tốt: không tiết lộ deck có tồn tại hay không với non-owner.
      currentUser = { ...userB };

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/vocab-lab/decks/${DECK_ID}`)
        .send({ name: 'hijacked' })
        .set('Authorization', 'Bearer fake-token-b');

      expect(res.status).toBe(404);
    });

    it('TC_SEC_02: DELETE /api/v1/vocab-lab/decks/:id với token userB → 404', async () => {
      // VocabLabService.deleteDeck(userId, deckId):
      //   findFirst({ where: { id: deckId, userId } }) → null khi userId = userB.id
      //   → NotFoundException → 404.
      // Prisma.deck.delete không được gọi (resource bị che khuất).
      currentUser = { ...userB };

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/vocab-lab/decks/${DECK_ID}`)
        .set('Authorization', 'Bearer fake-token-b');

      expect(res.status).toBe(404);
      expect(prismaMock.deck.delete).not.toHaveBeenCalled();
    });

    it('TC_SEC_03: GET /api/v1/vocab-lab/decks/:id/cards với token userB → 404', async () => {
      // /vocab-lab/decks/:id/cards không tồn tại trong controller.
      // Endpoint thực tế là GET /vocab-lab/cards?deckId=... và luôn filter
      // by deck.userId → không có data leak qua URL pattern này.
      currentUser = { ...userB };

      const res = await request(app.getHttpServer())
        .get(`/api/v1/vocab-lab/decks/${DECK_ID}/cards`)
        .set('Authorization', 'Bearer fake-token-b');

      expect(res.status).toBe(404);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Nhóm 2 — Notes Ownership
  // ───────────────────────────────────────────────────────────────────────────

  describe('Nhóm 2 — Notes Ownership', () => {
    let app: INestApplication;

    const noteA = {
      id: NOTE_ID,
      userId: userA.id,
      examId: 'exam-001',
      questionNumber: 1,
      noteText: 'secret note',
    };

    const prismaMock: any = {
      questionNote: {
        findMany: jest.fn().mockResolvedValue([noteA]),
        delete: jest.fn().mockResolvedValue(noteA),
        upsert: jest.fn().mockResolvedValue(noteA),
      },
    };

    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [NotesController],
        providers: [
          NotesService,
          { provide: PrismaService, useValue: prismaMock },
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
      );
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    beforeEach(() => { jest.clearAllMocks(); });

    it('TC_SEC_04: DELETE /api/v1/notes/:id với token userB → 404 [SECURITY GAP — hiện trả 200]', async () => {
      /**
       * SECURITY GAP: NotesController không có @UseGuards(JwtAuthGuard) và
       * NotesService.deleteNote(id) không kiểm tra ownership — bất kỳ request
       * nào (kể cả unauthenticated) đều có thể xóa note của người khác.
       *
       * Fix cần làm:
       *   1. Thêm @UseGuards(JwtAuthGuard) trên NotesController.
       *   2. Trong deleteNote, nhận thêm userId: tìm note theo { id, userId },
       *      throw NotFoundException nếu không tìm thấy, sau đó mới delete.
       *
       * Test này dự kiến FAIL cho đến khi fix được merge.
       * Sau khi fix: xóa comment "[SECURITY GAP ...]" khỏi tên test.
       */
      prismaMock.questionNote.delete.mockResolvedValue(noteA);

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/notes/${NOTE_ID}`)
        .set('Authorization', 'Bearer fake-token-b');

      // Desired: 404 (non-owner không được biết resource tồn tại).
      expect(res.status).toBe(404);
    });

    it('TC_SEC_05: PATCH /api/v1/notes/:id với token userB → 404', async () => {
      // PATCH /notes/:id không được định nghĩa trong NotesController.
      // Không có data leakage qua route này.
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/notes/${NOTE_ID}`)
        .send({ noteText: 'hijacked' })
        .set('Authorization', 'Bearer fake-token-b');

      expect(res.status).toBe(404);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Nhóm 3 — Posts Ownership
  // ───────────────────────────────────────────────────────────────────────────

  describe('Nhóm 3 — Posts Ownership', () => {
    let app: INestApplication;
    let currentUser: Record<string, any>;

    const postA = { id: POST_ID, authorId: userA.id, body: 'Post by A' };

    const prismaMock: any = {
      post: {
        findUnique: jest.fn().mockResolvedValue(postA),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue(postA),
      },
      postLike: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      comment: { create: jest.fn() },
      $transaction: jest.fn(async (ops: any[]) => Promise.all(ops)),
    };

    const gamifMock = { onEvent: jest.fn().mockResolvedValue(undefined) };
    const storageMock = { uploadFile: jest.fn(), deleteFile: jest.fn() };

    const fakeJwtGuard = {
      canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().user = currentUser;
        return true;
      },
    };

    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [PostsController],
        providers: [
          PostsService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: GamificationService, useValue: gamifMock },
          { provide: StorageService, useValue: storageMock },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(fakeJwtGuard)
        .compile();

      app = moduleRef.createNestApplication();
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
      );
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    beforeEach(() => {
      jest.clearAllMocks();
      prismaMock.post.findUnique.mockResolvedValue(postA);
      currentUser = { ...userA };
    });

    it('TC_SEC_06: DELETE /api/v1/posts/:id với token userB (non-admin) → 403', async () => {
      // PostsService.deletePost:
      //   post.authorId ('user-a-001') !== userId ('user-b-002') → ForbiddenException → 403.
      // Resource TỒN TẠI nhưng bị deny (semantics của Posts: 403 thay vì 404,
      // vì post là public content không cần ẩn existence).
      currentUser = { ...userB };

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/posts/${POST_ID}`)
        .set('Authorization', 'Bearer fake-token-b');

      expect(res.status).toBe(403);
      expect(prismaMock.post.delete).not.toHaveBeenCalled();
    });

    it('TC_SEC_07: PATCH /api/v1/posts/:id với token userB → 404', async () => {
      // PATCH /posts/:id không được định nghĩa trong PostsController
      // (controller chỉ có POST, GET, DELETE cho posts).
      // Route not found → 404.
      currentUser = { ...userB };

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/posts/${POST_ID}`)
        .send({ body: 'hijacked content' })
        .set('Authorization', 'Bearer fake-token-b');

      expect(res.status).toBe(404);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Nhóm 4 — Admin Bypass
  // ───────────────────────────────────────────────────────────────────────────

  describe('Nhóm 4 — Admin Bypass', () => {
    let app: INestApplication;
    let currentUser: Record<string, any>;

    const postA = { id: POST_ID, authorId: userA.id, body: 'Post by A' };

    const prismaMock: any = {
      post: {
        findUnique: jest.fn().mockResolvedValue(postA),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue({ success: true }),
      },
      postLike: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      comment: { create: jest.fn() },
      $transaction: jest.fn(async (ops: any[]) => Promise.all(ops)),
    };

    const gamifMock = { onEvent: jest.fn().mockResolvedValue(undefined) };
    const storageMock = { uploadFile: jest.fn(), deleteFile: jest.fn() };

    const fakeJwtGuard = {
      canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().user = currentUser;
        return true;
      },
    };

    beforeAll(async () => {
      const moduleRef: TestingModule = await Test.createTestingModule({
        controllers: [PostsController],
        providers: [
          PostsService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: GamificationService, useValue: gamifMock },
          { provide: StorageService, useValue: storageMock },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue(fakeJwtGuard)
        .compile();

      app = moduleRef.createNestApplication();
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
      );
      await app.init();
    });

    afterAll(async () => { await app.close(); });

    beforeEach(() => {
      jest.clearAllMocks();
      prismaMock.post.findUnique.mockResolvedValue(postA);
      currentUser = { ...adminUser };
    });

    it('TC_SEC_08: DELETE /api/v1/posts/:id với token adminUser → 200 [SECURITY GAP — admin bypass chưa implement, hiện trả 403]', async () => {
      /**
       * SECURITY GAP: PostsService.deletePost kiểm tra post.authorId !== userId
       * mà không kiểm tra role. Admin (role ADMIN) vẫn bị ForbiddenException.
       *
       * Fix cần làm:
       *   Trong PostsService.deletePost, thêm:
       *     if (user.role === 'ADMIN') {
       *       await this.prisma.post.delete({ where: { id: postId } });
       *       return { success: true };
       *     }
       *   Hoặc dùng RolesGuard + @Roles('ADMIN') bypass ở controller.
       *
       * Test này dự kiến FAIL cho đến khi fix được merge.
       * Sau khi fix: xóa comment "[SECURITY GAP ...]" khỏi tên test
       * và thêm expect: expect(prismaMock.post.delete).toHaveBeenCalled().
       */
      currentUser = { ...adminUser };

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/posts/${POST_ID}`)
        .set('Authorization', 'Bearer fake-admin-token');

      // Desired: 200 (admin được phép xóa bất kỳ post nào).
      expect(res.status).toBe(200);
    });
  });
});
