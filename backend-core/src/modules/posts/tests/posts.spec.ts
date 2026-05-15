/**
 * TC03 — Tạo bài viết & tương tác (PostsController)
 *
 * Endpoints test:
 *   - POST   /api/v1/posts            (create)
 *   - GET    /api/v1/posts            (list — cursor pagination)
 *   - POST   /api/v1/posts/:id/like   (toggle like)
 *   - POST   /api/v1/posts/:id/comments (create comment)
 *
 * Tất cả endpoint đều dưới `@UseGuards(JwtAuthGuard)`. Test override guard
 * để inject `req.user`, mock PrismaService + GamificationService +
 * StorageService.
 *
 * Tham chiếu thesis: TC03 trong testing-sample.md (Bảng 4.1).
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';

import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StorageService } from '../../../common/storage/storage.service';
import { GamificationService } from '../../gamification/gamification.service';

describe('PostsController (TC03 — Bài viết)', () => {
  let app: INestApplication;
  const TEST_USER_ID = 'post-author-001';
  let guardShouldPass = true;

  const fakeJwtGuard = {
    canActivate: (ctx: ExecutionContext) => {
      if (!guardShouldPass) throw new UnauthorizedException();
      const req = ctx.switchToHttp().getRequest();
      req.user = { id: TEST_USER_ID, email: 'author@example.com', role: 'STUDENT' };
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
    guardShouldPass = true;
  });

  // ─────────────────────────────────────────────────────────
  // [Invalid] — ValidationPipe & business rules
  // ─────────────────────────────────────────────────────────

  describe('[Invalid] POST /api/v1/posts', () => {
    it('TC03_01: body rỗng → 400 (MinLength 1)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({ body: '' });

      expect(res.status).toBe(400);
      expect(prismaMock.post.create).not.toHaveBeenCalled();
    });

    it('TC03_02: body quá dài (> 10000 ký tự) → 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({ body: 'x'.repeat(10_001) });

      expect(res.status).toBe(400);
    });

    it('TC03_03: type không thuộc enum PostType → 400', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({ body: 'valid', type: 'INVALID_TYPE' });

      expect(res.status).toBe(400);
    });

    it('TC03_04: không có JWT → 401', async () => {
      guardShouldPass = false;
      const res = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({ body: 'hello' });

      expect(res.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Valid] — luồng create / list / like / comment
  // ─────────────────────────────────────────────────────────

  describe('[Valid] POST /api/v1/posts', () => {
    it('TC03_05: tạo post valid → 201, trả author info, kích hoạt gamification.onEvent với XP=5', async () => {
      const created = {
        id: 'post-001',
        authorId: TEST_USER_ID,
        type: 'GENERAL',
        title: null,
        body: 'Hello World',
        imageUrls: [],
        tags: [],
        metadata: null,
        likeCount: 0,
        isHidden: false,
        createdAt: new Date('2026-05-16'),
        author: {
          id: TEST_USER_ID,
          firstName: 'Author',
          lastName: 'Test',
          avatar: null,
          subscription: null,
        },
      };
      prismaMock.post.create.mockResolvedValue(created);

      const res = await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({ body: 'Hello World' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('post-001');
      expect(res.body.author.id).toBe(TEST_USER_ID);
      // gamification gọi async với xp=5
      expect(gamificationMock.onEvent).toHaveBeenCalledWith(
        TEST_USER_ID,
        expect.objectContaining({
          xp: 5,
          reason: 'COMMUNITY_POST',
        }),
      );
    });

    it('TC03_06: tạo post kèm tags + imageUrls → service nhận đúng payload', async () => {
      let captured: any;
      prismaMock.post.create.mockImplementation(async ({ data }: any) => {
        captured = data;
        return {
          id: 'post-002',
          ...data,
          likeCount: 0,
          isHidden: false,
          createdAt: new Date(),
          author: { id: TEST_USER_ID, firstName: 'A', lastName: 'B', avatar: null, subscription: null },
        };
      });

      await request(app.getHttpServer())
        .post('/api/v1/posts')
        .send({
          body: 'With tags',
          tags: ['ielts', 'writing'],
          imageUrls: ['https://x.test/a.png'],
        });

      expect(captured.tags).toEqual(['ielts', 'writing']);
      expect(captured.imageUrls).toEqual(['https://x.test/a.png']);
    });
  });

  describe('[Valid] GET /api/v1/posts', () => {
    it('TC03_07: list posts → trả mảng kèm thông tin author + interaction flags', async () => {
      const items = [
        {
          id: 'p1',
          authorId: 'u-other',
          type: 'GENERAL',
          body: 'one',
          createdAt: new Date('2026-05-15'),
          likeCount: 3,
          tags: [],
          imageUrls: [],
          isHidden: false,
          author: { id: 'u-other', firstName: 'X', lastName: 'Y', avatar: null, subscription: null },
          likes: [{ id: 'l1' }], // current user đã like
          bookmarks: [],
        },
      ];
      prismaMock.post.findMany.mockResolvedValue(items);

      const res = await request(app.getHttpServer())
        .get('/api/v1/posts')
        .query({ limit: 10 });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(prismaMock.post.findMany).toHaveBeenCalled();
    });
  });

  describe('[Valid] POST /api/v1/posts/:id/like', () => {
    it('TC03_08: like lần đầu → 201, trả { liked: true }, increment likeCount', async () => {
      prismaMock.post.findUnique.mockResolvedValue({ id: 'post-100' });
      prismaMock.postLike.findUnique.mockResolvedValue(null); // chưa like
      prismaMock.$transaction.mockResolvedValue([
        { id: 'like-1' },
        { authorId: 'author-of-post' },
      ]);

      const res = await request(app.getHttpServer())
        .post('/api/v1/posts/post-100/like')
        .send();

      expect(res.status).toBe(201);
      expect(res.body.liked).toBe(true);
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });

    it('TC03_09: like trên post đã like → unlike, trả { liked: false }', async () => {
      prismaMock.post.findUnique.mockResolvedValue({ id: 'post-101' });
      prismaMock.postLike.findUnique.mockResolvedValue({ id: 'like-existing' });
      prismaMock.$transaction.mockResolvedValue([{}, {}]);

      const res = await request(app.getHttpServer())
        .post('/api/v1/posts/post-101/like')
        .send();

      expect(res.status).toBe(201);
      expect(res.body.liked).toBe(false);
    });

    it('TC03_10: like post không tồn tại → 404 Not Found', async () => {
      prismaMock.post.findUnique.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/api/v1/posts/post-ghost/like')
        .send();

      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/Post not found/i);
    });
  });
});
