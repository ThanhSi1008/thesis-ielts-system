/**
 * TC02 — Đăng nhập (POST /api/v1/auth/login)
 *
 * Luồng thực tế trong code:
 *   AuthController.login() chỉ có @UseGuards(LocalAuthGuard) — KHÔNG bind
 *   @Body() LoginDto, nên ValidationPipe KHÔNG chạy cho endpoint này.
 *   Toàn bộ xác thực diễn ra trong LocalStrategy.validate() →
 *   AuthService.validateUser() → bcrypt.compare. Mọi trường hợp xác thực
 *   thất bại đều trả 401 "Invalid credentials".
 *
 * Vì vậy TC02_04 trong thesis ("password < 8 ký tự → 400") không khả thi
 * trên code hiện tại (không có MinLength + không có ValidationPipe). Test
 * dưới đây thay bằng: thiếu/empty payload → 401 (passport-local behavior).
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LocalStrategy } from '../strategies/local.strategy';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { PrismaService } from '../../../common/prisma/prisma.service';

describe('POST /api/v1/auth/login (TC02 — Đăng nhập)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  const correctEmail = 'login-ok@example.com';
  const correctPassword = 'Password1';
  let hashedPassword: string;
  const dbUser = {
    id: 'user-100',
    email: correctEmail,
    role: 'STUDENT' as const,
    firstName: 'Login',
    lastName: 'User',
    isActive: true,
    googleId: null,
    avatar: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    deck: { create: jest.fn() },
  };

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(correctPassword, 10);

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: 'test-jwt-secret',
              JWT_EXPIRATION: '1h',
              GOOGLE_CLIENT_ID: 'test-google-client-id',
            }),
          ],
        }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10_000 }]),
        PassportModule,
        JwtModule.register({
          secret: 'test-jwt-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        { provide: PrismaService, useValue: prismaMock },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
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

    jwtService = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.user.findUnique.mockImplementation(async ({ where }: any) => {
      if (where?.email === correctEmail) {
        return { ...dbUser, password: hashedPassword };
      }
      return null;
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Invalid] — sai credential → 401 Unauthorized
  // ─────────────────────────────────────────────────────────

  describe('[Invalid]', () => {
    it('TC02_01: email đúng + password sai → 401 "Invalid credentials"', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: correctEmail, password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid credentials/i);
    });

    it('TC02_02: email không tồn tại + password đúng → 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'unknown@example.com', password: correctPassword });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid credentials/i);
    });

    it('TC02_03: cả email và password đều sai → 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrong-password' });

      expect(res.status).toBe(401);
    });

    it('TC02_04: payload thiếu password → 401 (passport-local từ chối)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: correctEmail });

      expect(res.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Valid] — login thành công + verify JWT payload
  // ─────────────────────────────────────────────────────────

  describe('[Valid]', () => {
    it('TC02_05: email + password đúng → 200, trả { access_token, user }, JWT payload chứa { sub, email, role }', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: correctEmail, password: correctPassword });

      // 1) HTTP status
      expect(res.status).toBe(201); // NestJS default cho POST không khai báo @HttpCode

      // 2) Response body shape
      expect(res.body.access_token).toEqual(expect.any(String));
      expect(res.body.user).toMatchObject({
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
      });
      // password đã bị strip trong validateUser()
      expect(res.body.user).not.toHaveProperty('password');

      // 3) JWT payload chứa { sub, email, role }
      const decoded: any = jwtService.verify(res.body.access_token);
      expect(decoded.sub).toBe(dbUser.id);
      expect(decoded.email).toBe(dbUser.email);
      expect(decoded.role).toBe(dbUser.role);
      // chuẩn JWT: iat, exp được tự động thêm
      expect(decoded.iat).toEqual(expect.any(Number));
      expect(decoded.exp).toEqual(expect.any(Number));
    });
  });
});
