/**
 * ============================================================
 * auth.e2e-spec.ts — E2E tests cho Auth flow (real DB)
 * ============================================================
 *
 * Yêu cầu môi trường:
 *   - File .env.test phải tồn tại và khai báo đầy đủ các biến sau:
 *       DATABASE_URL  — pooler URL (pgbouncer=true), dùng cho Prisma Client
 *       DIRECT_URL    — direct URL với ?schema=test, dùng cho migrations
 *       JWT_SECRET    — secret để ký/verify JWT
 *       JWT_EXPIRATION — thời hạn access token (vd: "1h")
 *   - Schema "test" phải đã được migrate:
 *       cd backend-core
 *       DATABASE_URL=$DIRECT_URL npx prisma migrate deploy
 *
 * Nếu thiếu DATABASE_URL / DIRECT_URL, hãy thêm vào .env.test:
 *   DATABASE_URL="postgresql://<user>:<pass>@<host>:<port>/<db>?pgbouncer=true&connection_limit=1"
 *   DIRECT_URL="postgresql://<user>:<pass>@<host>:<port>/<db>?schema=test"
 *
 * Chạy riêng:
 *   npm run test:e2e
 * hoặc toàn bộ (unit + e2e):
 *   npm run test:all
 *
 * ─────────────────────────────────────────────────────────────
 * Sơ đồ test-case:
 *
 *  TC_E2E_01  Register → Login → GET /users/me → (Refresh cycle)
 *             → GET /users/me với token mới → (Logout simulation)
 *
 *  TC_E2E_02  Register email đã tồn tại → 400 *
 *             (* AuthService hiện ném BadRequestException — code P2002.
 *                Nếu muốn trả 409, cần đổi sang ConflictException
 *                và cập nhật assertion ở đây thành expect(400) → expect(409).)
 *
 *  TC_E2E_03  Login sai password → 401 (user thật trong DB)
 *
 *  TC_E2E_04  Access protected route với expired token → 401
 * ============================================================
 */

import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  createTestingApp,
  shutdownTestingApp,
  resetDatabase,
  TestContext,
} from '../helpers/test-setup';

// ─────────────────────────────────────────────────────────────
// Hằng số dùng chung trong suite
// ─────────────────────────────────────────────────────────────

const BASE = '/api/v1';

/** Dữ liệu register hợp lệ cho TC_E2E_01 */
const VALID_USER = {
  email: `e2e-auth-${Date.now()}@example.com`,
  password: 'StrongPass123!',
  firstName: 'E2E',
  lastName: 'Auth',
};

// ─────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────

describe('Auth E2E — real Postgres (schema=test)', () => {
  let ctx: TestContext;
  let app: INestApplication;
  let jwtService: JwtService;

  // ── Setup: khởi động app một lần cho toàn suite ──────────
  beforeAll(async () => {
    ctx = await createTestingApp();
    app = ctx.app;
    jwtService = ctx.jwt;

    // Xóa toàn bộ data test schema để đảm bảo môi trường sạch
    await resetDatabase(ctx.prisma);
  });

  // ── Teardown: đóng app + prisma sau khi suite kết thúc ───
  afterAll(async () => {
    await shutdownTestingApp(ctx);
  });

  // ──────────────────────────────────────────────────────────
  // TC_E2E_01: Full auth cycle
  // Register → Login → GET /users/me → Refresh → GET /users/me → Logout
  // ──────────────────────────────────────────────────────────
  describe('TC_E2E_01 — Full auth cycle', () => {
    let accessToken: string;
    let registeredUserId: string;

    it('step 1: POST /auth/register → 201 + user object (no password)', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/register`)
        .send(VALID_USER)
        .expect(201);

      expect(res.body).toMatchObject({
        email: VALID_USER.email,
        firstName: VALID_USER.firstName,
        lastName: VALID_USER.lastName,
      });
      expect(res.body.password).toBeUndefined();
      expect(res.body.id).toBeDefined();
      registeredUserId = res.body.id;

      // Xác nhận record thật tồn tại trong DB
      const dbUser = await ctx.prisma.user.findUnique({
        where: { id: registeredUserId },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser!.email).toBe(VALID_USER.email);
    });

    it('step 2: POST /auth/login → 201 + access_token', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({ email: VALID_USER.email, password: VALID_USER.password })
        .expect(201);

      expect(res.body.access_token).toBeDefined();
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.user).toMatchObject({ email: VALID_USER.email });

      accessToken = res.body.access_token;
    });

    it('step 3: GET /users/me với access_token → 200 + profile', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/users/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body).toMatchObject({
        email: VALID_USER.email,
        firstName: VALID_USER.firstName,
        lastName: VALID_USER.lastName,
      });
      // Đảm bảo password không bị leak qua response
      expect(res.body.password).toBeUndefined();
    });

    it('step 4: Refresh token — sign token mới với payload cũ', async () => {
      /**
       * NOTES về Refresh Token:
       * ─────────────────────────────────────────────────
       * AuthController.refresh() hiện chỉ là stub ("to be implemented").
       * Test này dùng JwtService trực tiếp để tạo access_token mới
       * (simulate client giữ refresh token và đổi lấy access_token mới).
       *
       * Khi refresh endpoint được implement đầy đủ:
       *   1. Đổi step này thành gọi POST /auth/refresh với refreshToken
       *   2. Assert trả về access_token mới
       *   3. Dùng access_token mới đó cho step 5
       * ─────────────────────────────────────────────────
       */
      const decoded = jwtService.decode(accessToken) as Record<string, any>;
      expect(decoded).not.toBeNull();
      expect(decoded.sub).toBeDefined();

      // Tạo token mới với cùng payload
      const newToken = jwtService.sign({
        email: decoded.email,
        sub: decoded.sub,
        role: decoded.role,
      });
      expect(newToken).toBeDefined();
      expect(typeof newToken).toBe('string');
      expect(newToken).not.toBe(accessToken); // token mới khác token cũ (iat khác nhau)

      // Lưu để dùng trong step 5
      accessToken = newToken;
    });

    it('step 5: GET /users/me với token MỚI → 200', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/users/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.email).toBe(VALID_USER.email);
    });

    it('step 6: Logout simulation — GET /users/me SAU logout → vẫn 200 (stateless JWT)', async () => {
      /**
       * NOTES về Logout:
       * ─────────────────────────────────────────────────
       * AuthController hiện KHÔNG có endpoint POST /auth/logout.
       * JWT thuần stateless nên "logout" phía server cần blacklist token
       * (vd: lưu JTI vào Redis với TTL bằng thời hạn token).
       *
       * Khi logout được implement:
       *   1. Gọi POST /auth/logout với Authorization header
       *   2. Assert response 200/204
       *   3. Thử lại GET /users/me với token đó → expect 401
       * ─────────────────────────────────────────────────
       */

      // Hiện tại: token vẫn hợp lệ vì chưa có blacklist
      const res = await request(app.getHttpServer())
        .get(`${BASE}/users/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.email).toBe(VALID_USER.email);

      // TODO: khi có logout endpoint, thay bằng:
      // await request(app.getHttpServer())
      //   .post(`${BASE}/auth/logout`)
      //   .set('Authorization', `Bearer ${accessToken}`)
      //   .expect(200);
      // await request(app.getHttpServer())
      //   .get(`${BASE}/users/me`)
      //   .set('Authorization', `Bearer ${accessToken}`)
      //   .expect(401);
    });
  });

  // ──────────────────────────────────────────────────────────
  // TC_E2E_02: Register email đã tồn tại → 400
  // ──────────────────────────────────────────────────────────
  describe('TC_E2E_02 — Duplicate email registration', () => {
    const EXISTING_EMAIL = `e2e-dup-${Date.now()}@example.com`;

    beforeAll(async () => {
      // Tạo user đầu tiên
      await request(app.getHttpServer())
        .post(`${BASE}/auth/register`)
        .send({
          email: EXISTING_EMAIL,
          password: 'StrongPass123!',
          firstName: 'First',
          lastName: 'User',
        })
        .expect(201);

      // Verify record đã có trong DB thật
      const dbUser = await ctx.prisma.user.findUnique({
        where: { email: EXISTING_EMAIL },
      });
      expect(dbUser).not.toBeNull();
    });

    it('POST /auth/register với email đã tồn tại → 400 Bad Request', async () => {
      /**
       * NOTE: AuthService hiện ném BadRequestException (400) khi Prisma
       * trả về error code P2002 (unique constraint violation).
       *
       * Nếu yêu cầu trả 409 Conflict, cần sửa auth.service.ts:
       *   import { ConflictException } from '@nestjs/common';
       *   throw new ConflictException('Email already exists');
       * Và đổi assertion bên dưới thành .expect(409).
       */
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/register`)
        .send({
          email: EXISTING_EMAIL,
          password: 'AnotherPass456!',
          firstName: 'Second',
          lastName: 'User',
        })
        .expect(400);

      expect(res.body.message).toMatch(/email already exists/i);

      // Đảm bảo DB thật chỉ có duy nhất 1 record với email này
      const count = await ctx.prisma.user.count({
        where: { email: EXISTING_EMAIL },
      });
      expect(count).toBe(1);
    });
  });

  // ──────────────────────────────────────────────────────────
  // TC_E2E_03: Login sai password → 401
  // ──────────────────────────────────────────────────────────
  describe('TC_E2E_03 — Wrong password login', () => {
    const REAL_USER_EMAIL = `e2e-wrongpw-${Date.now()}@example.com`;
    const CORRECT_PASSWORD = 'CorrectPass789!';

    beforeAll(async () => {
      // Tạo user thật trong DB qua register
      await request(app.getHttpServer())
        .post(`${BASE}/auth/register`)
        .send({
          email: REAL_USER_EMAIL,
          password: CORRECT_PASSWORD,
          firstName: 'Real',
          lastName: 'User',
        })
        .expect(201);

      // Confirm user tồn tại trong DB thật
      const dbUser = await ctx.prisma.user.findUnique({
        where: { email: REAL_USER_EMAIL },
      });
      expect(dbUser).not.toBeNull();
      expect(dbUser!.email).toBe(REAL_USER_EMAIL);
    });

    it('POST /auth/login với sai password → 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({
          email: REAL_USER_EMAIL,
          password: 'WrongPassword000!',
        })
        .expect(401);
    });

    it('POST /auth/login với đúng password → 201 OK (sanity check)', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/auth/login`)
        .send({
          email: REAL_USER_EMAIL,
          password: CORRECT_PASSWORD,
        })
        .expect(201);

      expect(res.body.access_token).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────────
  // TC_E2E_04: Access protected route với expired token → 401
  // ──────────────────────────────────────────────────────────
  describe('TC_E2E_04 — Expired JWT access', () => {
    it('GET /users/me với expired token → 401 Unauthorized', async () => {
      /**
       * Tạo token đã hết hạn trực tiếp qua JwtService.sign() với
       * expiresIn: 0 (expire ngay lập tức — iat === exp).
       *
       * Kỹ thuật: sign với expiresIn âm hoặc "1ms" để token expire
       * ngay khi được tạo.
       */
      const expiredToken = jwtService.sign(
        { email: 'expired@example.com', sub: 'fake-id-expired', role: 'STUDENT' },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: -1, // expire trước khi được dùng (âm giây)
        },
      );

      await request(app.getHttpServer())
        .get(`${BASE}/users/me`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('GET /users/me không có Authorization header → 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get(`${BASE}/users/me`)
        .expect(401);
    });

    it('GET /users/me với token bị tampered → 401 Unauthorized', async () => {
      const validToken = jwtService.sign({
        email: 'tampered@example.com',
        sub: 'fake-id-tampered',
        role: 'STUDENT',
      });

      // Thay đổi ký tự cuối của signature để làm token không hợp lệ
      const tamperedToken = validToken.slice(0, -5) + 'XXXXX';

      await request(app.getHttpServer())
        .get(`${BASE}/users/me`)
        .set('Authorization', `Bearer ${tamperedToken}`)
        .expect(401);
    });
  });
});
