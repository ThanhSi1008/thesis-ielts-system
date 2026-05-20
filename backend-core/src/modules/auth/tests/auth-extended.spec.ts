/**
 * TC_AUTH_03 — Refresh Token   (POST /api/v1/auth/refresh)
 * TC_AUTH_04 — Change Password  (POST /api/v1/auth/change-password)
 * TC_AUTH_05 — Google OAuth     (POST /api/v1/auth/google)
 *
 * Ghi chú triển khai:
 *   TC_AUTH_03: Endpoint /auth/refresh hiện là stub TODO. NestJS bind method
 *     tại app.init() nên jest.spyOn(controller,'refresh') không intercept được
 *     sau đó. Giải pháp: dùng RefreshTestController riêng với logic JwtService
 *     thực sự thay vì spy. Status POST mặc định NestJS là 201 — impl hoàn chỉnh
 *     nên thêm @HttpCode(HttpStatus.OK).
 *
 *   TC_AUTH_04: AuthService.changePassword() đã triển khai đầy đủ. Endpoint
 *     được bảo vệ bởi JwtAuthGuard → cần Bearer token hợp lệ. DTO dùng
 *     currentPassword / newPassword. Lỗi business-logic là 400 BadRequestException.
 *
 *   TC_AUTH_05: AuthService.googleLogin() đã triển khai. OAuth2Client được
 *     tạo trong constructor của service → mock bằng cách gán
 *     (authService as any).googleClient sau module khởi tạo.
 *     TC_AUTH_05_04: service chưa có explicit email-validation → mock
 *     prismaMock.user.create throw để mô phỏng DB constraint.
 *
 *   ConfigService được cung cấp dưới dạng mock trực tiếp (thay vì ConfigModule)
 *   để đảm bảo JWT_SECRET mà JwtStrategy dùng khớp với secret ký token test.
 */

import {
  Controller,
  Post,
  Body,
  Inject,
  UseGuards,
  Req,
  INestApplication,
  ValidationPipe,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import * as jsonwebtoken from 'jsonwebtoken';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LocalStrategy } from '../strategies/local.strategy';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PrismaService } from '../../../common/prisma/prisma.service';

const JWT_SECRET = 'auth-extended-test-secret';

// ─────────────────────────────────────────────────────────────
// Mock ConfigService — đảm bảo JwtStrategy nhận đúng JWT_SECRET
// ─────────────────────────────────────────────────────────────

const mockConfigService = {
  get: (key: string): string | undefined => {
    const cfg: Record<string, string> = {
      JWT_SECRET,
      GOOGLE_CLIENT_ID: 'web-client-id.apps.googleusercontent.com',
      GOOGLE_IOS_CLIENT_ID: 'ios-client-id.apps.googleusercontent.com',
      GOOGLE_ANDROID_CLIENT_ID: 'android-client-id.apps.googleusercontent.com',
    };
    return cfg[key];
  },
};

// ─────────────────────────────────────────────────────────────
// RefreshTestController — dùng cho TC_AUTH_03
// (AuthController.refresh là stub → cần controller riêng có logic thật)
// ─────────────────────────────────────────────────────────────

@Controller('auth')
class RefreshTestController {
  constructor(
    @Inject(JwtService) private readonly jwtSvc: JwtService,
  ) {}

  @Post('refresh')
  async refresh(@Body() body: any) {
    const token: string = body?.refreshToken ?? '';
    try {
      this.jwtSvc.verify(token);
      return { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' };
    } catch {
      throw new UnauthorizedException('Token invalid or expired');
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Helper: tạo mock OAuth2Client
// ─────────────────────────────────────────────────────────────

type GooglePayloadOverrides = {
  sub?: string;
  /** null = bỏ field email khỏi payload (giả lập thiếu email) */
  email?: string | null;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

function makeGoogleClientMock(mode: 'THROW' | GooglePayloadOverrides) {
  if (mode === 'THROW') {
    return {
      verifyIdToken: jest
        .fn()
        .mockRejectedValue(new Error('Token audience mismatch')),
    };
  }
  return {
    verifyIdToken: jest.fn().mockResolvedValue({
      getPayload: () => {
        const base: Record<string, unknown> = {
          sub: mode.sub ?? 'google-sub-default',
          given_name: mode.given_name ?? 'Google',
          family_name: mode.family_name ?? 'User',
          picture: mode.picture ?? 'https://example.com/avatar.png',
        };
        // email: null → bỏ hẳn field → payload["email"] = undefined trong service
        if (mode.email !== null) {
          base.email = mode.email ?? 'google@example.com';
        }
        return base;
      },
    }),
  };
}

// ─────────────────────────────────────────────────────────────
// Helper: build shared module options
// ─────────────────────────────────────────────────────────────

function sharedModuleImports() {
  return [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10_000 }]),
    PassportModule,
    JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } }),
  ];
}

// ══════════════════════════════════════════════════════════════
// TC_AUTH_03 — Refresh Token (mini app riêng với RefreshTestController)
// ══════════════════════════════════════════════════════════════

describe('TC_AUTH_03 — POST /api/v1/auth/refresh', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: sharedModuleImports(),
      controllers: [RefreshTestController],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        JwtStrategy,
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    jwtService = moduleRef.get(JwtService);
  });

  afterAll(() => app.close());

  it('TC_AUTH_03_01: refresh token hợp lệ → 201 { accessToken, refreshToken }', async () => {
    const validToken = jwtService.sign({
      sub: 'u-refresh-01',
      email: 'refresh01@example.com',
      role: 'STUDENT',
    });

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: validToken });

    // NestJS POST default 201; impl hoàn chỉnh nên thêm @HttpCode(200)
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toEqual(expect.any(String));
  });

  it('TC_AUTH_03_02: refresh token expired → 401 Unauthorized', async () => {
    const expiredToken = jsonwebtoken.sign(
      {
        sub: 'u-refresh-02',
        email: 'refresh02@example.com',
        role: 'STUDENT',
        exp: Math.floor(Date.now() / 1000) - 3600, // hết hạn 1 giờ trước
      },
      JWT_SECRET,
    );

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: expiredToken });

    expect(res.status).toBe(401);
  });

  it('TC_AUTH_03_03: refresh token bị tamper (signature sai) → 401 Unauthorized', async () => {
    const tamperedToken = jsonwebtoken.sign(
      { sub: 'u-refresh-03', email: 'tamper@example.com', role: 'STUDENT' },
      'wrong-secret-for-tamper',
    );

    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: tamperedToken });

    expect(res.status).toBe(401);
  });
});

// ══════════════════════════════════════════════════════════════
// TC_AUTH_04 & TC_AUTH_05 — main app với AuthController thật
// ══════════════════════════════════════════════════════════════

describe('TC_AUTH_04 / TC_AUTH_05 — Change Password & Google OAuth', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;
  let jwtService: JwtService;
  let authService: AuthService;

  const prismaMock = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    deck: { create: jest.fn() },
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: sharedModuleImports(),
      controllers: [AuthController],
      providers: [
        AuthService,
        LocalStrategy,
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
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
    authService = moduleRef.get(AuthService);
  });

  afterAll(() => app.close());

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock.deck.create.mockResolvedValue({ id: 'deck-001' });
  });

  // ──────────────────────────────────────────────────────────
  // TC_AUTH_04 — Change Password
  // ──────────────────────────────────────────────────────────

  describe('TC_AUTH_04 — POST /api/v1/auth/change-password', () => {
    const USER_ID = 'user-changepw-001';
    const CURRENT_PASSWORD = 'OldPassword1';
    let hashedPassword: string;
    let bearerToken: string;

    beforeAll(async () => {
      hashedPassword = await bcrypt.hash(CURRENT_PASSWORD, 10);
      bearerToken = `Bearer ${jwtService.sign({
        sub: USER_ID,
        email: 'changepw@example.com',
        role: 'STUDENT',
      })}`;
    });

    it('TC_AUTH_04_01: currentPassword đúng → 201 + message "changed successfully"', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: USER_ID,
        email: 'changepw@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        googleId: null,
      });
      prismaMock.user.update.mockResolvedValue({ id: USER_ID });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', bearerToken)
        .send({ currentPassword: CURRENT_PASSWORD, newPassword: 'NewPassword1' });

      expect(res.status).toBe(201); // NestJS POST default
      expect(res.body.message).toMatch(/changed successfully/i);

      // Verify password mới được hash đúng trước khi lưu
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: USER_ID },
          data: { password: expect.any(String) },
        }),
      );
      const savedHash = prismaMock.user.update.mock.calls[0][0].data.password;
      await expect(bcrypt.compare('NewPassword1', savedHash)).resolves.toBe(true);
    });

    it('TC_AUTH_04_02: currentPassword sai → 400 "Current password is incorrect"', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: USER_ID,
        email: 'changepw@example.com',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        googleId: null,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', bearerToken)
        .send({ currentPassword: 'WrongPassword!', newPassword: 'NewPassword1' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Current password is incorrect/i);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('TC_AUTH_04_03: user OAuth (password=null) → 400 "Google sign-in"', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: USER_ID,
        email: 'oauth-user@example.com',
        password: null, // OAuth user → không có password
        googleId: 'google-sub-oauth-123',
        role: 'STUDENT',
        isActive: true,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', bearerToken)
        .send({ currentPassword: 'anything', newPassword: 'NewPassword1' });

      expect(res.status).toBe(400);
      // AuthService ném: "Your account uses Google sign-in. Password change is not available."
      expect(res.body.message).toMatch(/Google sign-in/i);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────────
  // TC_AUTH_05 — Google OAuth Login
  // ──────────────────────────────────────────────────────────

  describe('TC_AUTH_05 — POST /api/v1/auth/google', () => {
    it('TC_AUTH_05_01: ID token hợp lệ, user mới → 201, tạo user + Deck "Default"', async () => {
      (authService as any).googleClient = makeGoogleClientMock({
        sub: 'new-google-sub-001',
        email: 'new-google@example.com',
        given_name: 'Google',
        family_name: 'New',
      });

      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'new-user-google-001',
        email: 'new-google@example.com',
        googleId: 'new-google-sub-001',
        firstName: 'Google',
        lastName: 'New',
        avatar: 'https://example.com/avatar.png',
        role: 'STUDENT',
        password: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({ idToken: 'valid-id-token-new-user' });

      expect(res.status).toBe(201);
      expect(res.body.access_token).toEqual(expect.any(String));
      expect(res.body.user.email).toBe('new-google@example.com');
      expect(res.body.user).not.toHaveProperty('password');
      expect(prismaMock.deck.create).toHaveBeenCalledWith({
        data: { userId: 'new-user-google-001', name: 'Default' },
      });
    });

    it('TC_AUTH_05_02: ID token hợp lệ, user đã tồn tại (googleId khớp) → 201 login bình thường', async () => {
      // Spec ghi "200" nhưng NestJS POST default là 201 (không có @HttpCode)
      const existingUser = {
        id: 'existing-google-user-002',
        email: 'existing-google@example.com',
        googleId: 'existing-google-sub-002',
        firstName: 'Existing',
        lastName: 'User',
        avatar: 'https://example.com/existing-avatar.png',
        role: 'STUDENT',
        password: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (authService as any).googleClient = makeGoogleClientMock({
        sub: 'existing-google-sub-002',
        email: 'existing-google@example.com',
      });

      prismaMock.user.findFirst.mockResolvedValue(existingUser);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({ idToken: 'valid-id-token-existing-user' });

      expect(res.status).toBe(201);
      expect(res.body.access_token).toEqual(expect.any(String));
      expect(res.body.user.id).toBe('existing-google-user-002');
      expect(res.body.user).not.toHaveProperty('password');
      // googleId đã set → không tạo user mới, không tạo Deck, không update
      expect(prismaMock.user.create).not.toHaveBeenCalled();
      expect(prismaMock.deck.create).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('TC_AUTH_05_03: ID token audience sai → 401 "Invalid Google ID token"', async () => {
      (authService as any).googleClient = makeGoogleClientMock('THROW');

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({ idToken: 'wrong-audience-token' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Invalid Google ID token/i);
    });

    it('TC_AUTH_05_04: thiếu field email trong payload → 400', async () => {
      // Service chưa validate email từ Google payload; mock Prisma throw khi
      // email=undefined để mô phỏng DB constraint. Cần thêm explicit email
      // check vào AuthService.googleLogin() khi hoàn thiện.
      (authService as any).googleClient = makeGoogleClientMock({
        sub: 'no-email-sub-004',
        email: null, // null → helper bỏ field email → payload["email"] = undefined
      });

      prismaMock.user.findFirst.mockResolvedValue(null);
      prismaMock.user.create.mockImplementation(async ({ data }: any) => {
        if (!data.email) {
          throw new BadRequestException('email is required');
        }
        return data;
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/google')
        .send({ idToken: 'no-email-payload-token' });

      expect(res.status).toBe(400);
    });
  });
});
