/**
 * TC01 — Đăng ký (POST /api/v1/auth/register)
 *
 * Test plan thesis (Bảng 4.1) viết cho luồng đăng ký có OTP và validator
 * "username chứa ký tự đặc biệt", nhưng code thực tế trong backend-core
 * (RegisterDto + AuthService.register) HIỆN TẠI:
 *   - Không có field `username`, không có OTP flow, không có `isVerified`.
 *   - RegisterDto: email (IsEmail) + password (MinLength 6) + firstName +
 *     lastName + role optional.
 *   - register() hash password bằng bcrypt, tạo user, tạo Deck "Default",
 *     trả SafeUser (loại bỏ password). P2002 → 400 "Email already exists".
 *
 * Các test dưới đây giữ NUMERIC ID (TC01_01…TC01_08) khớp với thesis nhưng
 * mô tả case đã được điều chỉnh để chạy thật trên code hiện tại.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LocalStrategy } from '../strategies/local.strategy';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { PrismaService } from '../../../common/prisma/prisma.service';

describe('POST /api/v1/auth/register (TC01 — Đăng ký)', () => {
  let app: INestApplication;
  let prismaMock: {
    user: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
    };
    deck: { create: jest.Mock };
  };

  beforeAll(async () => {
    prismaMock = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
      deck: { create: jest.fn().mockResolvedValue({ id: 'deck-001' }) },
    };

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
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────
  // [Invalid] — ValidationPipe + business rules
  // ─────────────────────────────────────────────────────────

  describe('[Invalid]', () => {
    it('TC01_01: firstName rỗng → 400 Bad Request (IsNotEmpty)', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'tc01-01@example.com',
          password: 'Password1',
          firstName: '',
          lastName: 'User',
        });

      expect(res.status).toBe(400);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('TC01_02: email sai định dạng → 400 "Invalid email format"', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'Password1',
          firstName: 'First',
          lastName: 'Last',
        });

      expect(res.status).toBe(400);
      const messages = Array.isArray(res.body.message)
        ? res.body.message.join(' ')
        : String(res.body.message ?? '');
      expect(messages).toMatch(/Invalid email format/i);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('TC01_03: password < 6 ký tự → 400 "Password must be at least 6 characters"', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'tc01-03@example.com',
          password: 'p12',
          firstName: 'First',
          lastName: 'Last',
        });

      expect(res.status).toBe(400);
      const messages = Array.isArray(res.body.message)
        ? res.body.message.join(' ')
        : String(res.body.message ?? '');
      expect(messages).toMatch(/Password must be at least 6 characters/i);
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('TC01_04: email đã tồn tại (Prisma P2002) → 400 "Email already exists"', async () => {
      prismaMock.user.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password1',
          firstName: 'First',
          lastName: 'Last',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Email already exists/i);
      expect(prismaMock.deck.create).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Valid] — luồng tạo user thành công
  // ─────────────────────────────────────────────────────────

  describe('[Valid]', () => {
    it('TC01_05: payload hợp lệ → 201, trả SafeUser (không có password)', async () => {
      const createdAt = new Date('2026-05-16T00:00:00Z');
      prismaMock.user.create.mockImplementation(async ({ data }: any) => ({
        id: 'user-001',
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role ?? 'STUDENT',
        isActive: true,
        googleId: null,
        avatar: null,
        createdAt,
        updatedAt: createdAt,
      }));

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'new-user@example.com',
          password: 'Password1',
          firstName: 'New',
          lastName: 'User',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('user-001');
      expect(res.body.email).toBe('new-user@example.com');
      expect(res.body.firstName).toBe('New');
      expect(res.body.lastName).toBe('User');
      expect(res.body.role).toBe('STUDENT');
      expect(res.body).not.toHaveProperty('password');
    });

    it('TC01_06: password được lưu dưới dạng bcrypt hash, không phải plaintext', async () => {
      let captured: any;
      prismaMock.user.create.mockImplementation(async ({ data }: any) => {
        captured = data;
        return {
          id: 'user-002',
          ...data,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'hash-check@example.com',
          password: 'MySecret123',
          firstName: 'A',
          lastName: 'B',
        });

      expect(captured.password).not.toBe('MySecret123');
      const ok = await bcrypt.compare('MySecret123', captured.password);
      expect(ok).toBe(true);
    });

    it('TC01_07: tạo user thành công kéo theo tạo Deck "Default" cho Vocab Lab', async () => {
      prismaMock.user.create.mockResolvedValue({
        id: 'user-003',
        email: 'deck-check@example.com',
        firstName: 'A',
        lastName: 'B',
        role: 'STUDENT',
        password: 'hashed',
        isActive: true,
        googleId: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'deck-check@example.com',
          password: 'Password1',
          firstName: 'A',
          lastName: 'B',
        });

      expect(prismaMock.deck.create).toHaveBeenCalledWith({
        data: { userId: 'user-003', name: 'Default' },
      });
    });

    it('TC01_08: không truyền role → mặc định "STUDENT"; truyền role → tôn trọng giá trị', async () => {
      const captured: any[] = [];
      prismaMock.user.create.mockImplementation(async ({ data }: any) => {
        captured.push(data);
        return {
          id: `u-${captured.length}`,
          ...data,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });

      // (a) không truyền role
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'role-default@example.com',
          password: 'Password1',
          firstName: 'A',
          lastName: 'B',
        });
      expect(captured[0].role).toBe('STUDENT');

      // (b) truyền role ADMIN
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'role-admin@example.com',
          password: 'Password1',
          firstName: 'A',
          lastName: 'B',
          role: 'ADMIN',
        });
      expect(captured[1].role).toBe('ADMIN');
    });
  });
});
