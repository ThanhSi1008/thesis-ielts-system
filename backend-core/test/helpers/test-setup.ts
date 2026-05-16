/**
 * Test infrastructure cho backend-core.
 *
 * Cung cấp:
 *   - createTestingApp()           — bootstrap NestJS testing module (đã apply
 *                                    ValidationPipe, prefix /api/v1, các mock
 *                                    mặc định cho AiClient / Storage / Google
 *                                    OAuth, và load .env.test).
 *   - shutdownTestingApp()         — đóng app + ngắt Prisma cho mỗi suite.
 *   - resetDatabase()              — TRUNCATE toàn bộ bảng trên current_schema
 *                                    (tôn trọng ?schema=test trong DATABASE_URL).
 *   - createTestUser()             — tạo user kèm bcrypt password và JWT đã ký.
 *   - createAdminUser()            — tạo user role ADMIN.
 *   - Mock factories cho các external service: Gemini, Email, STT, TTS,
 *     AiClient (RabbitMQ publisher), Storage (Cloudinary), Google OAuth.
 *
 * File này được dùng bởi cả unit test (override một module nhỏ) và e2e test
 * (bootstrap toàn bộ AppModule). Để dùng trong unit test, gọi trực tiếp các
 * mock factory; để dùng trong e2e, gọi createTestingApp().
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/prisma/prisma.service';
import { StorageService } from '../../src/common/storage/storage.service';
import { AiClientService } from '../../src/modules/ai-client/ai-client.service';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface ProviderOverride {
  provide: any;
  useValue: any;
}

export interface CreateTestingAppOptions {
  /** Thêm hoặc thay thế các provider override mặc định */
  overrides?: ProviderOverride[];
  /** true = không apply override mặc định cho AiClient/Storage */
  disableDefaultMocks?: boolean;
}

export interface TestContext {
  app: INestApplication;
  moduleRef: TestingModule;
  prisma: PrismaService;
  jwt: JwtService;
}

export interface CreateTestUserOptions {
  email?: string;
  password?: string;
  role?: UserRole;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface TestUser {
  id: string;
  email: string;
  /** Plaintext password — dùng cho test login flow */
  password: string;
  /** JWT đã ký với JWT_SECRET hiện tại của app */
  token: string;
  /** Header value sẵn dùng: `Bearer <token>` */
  authHeader: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
}

// ─────────────────────────────────────────────────────────────
// Mock factories — external services
// ─────────────────────────────────────────────────────────────

/**
 * Mock cho AiClientService: stub publish RabbitMQ để test KHÔNG mở kết nối thật
 * tới CloudAMQP.
 */
export const createMockAiClientService = () => ({
  publishGradingTask: jest.fn().mockResolvedValue(undefined),
  publishTranscriptionTask: jest.fn().mockResolvedValue(undefined),
  onModuleInit: jest.fn().mockResolvedValue(undefined),
  onModuleDestroy: jest.fn().mockResolvedValue(undefined),
});

/**
 * Mock cho StorageService (Cloudinary): trả về URL giả, không gọi API ngoài.
 */
export const createMockStorageService = () => ({
  uploadFile: jest
    .fn()
    .mockResolvedValue(
      'https://res.cloudinary.com/test-cloud/image/upload/v0/mock-file.png',
    ),
  deleteFile: jest.fn().mockResolvedValue(undefined),
});

/**
 * Mock Gemini API. backend-core hiện không gọi Gemini trực tiếp (luồng chấm
 * qua backend-ai), nhưng mock này có sẵn cho chat proxy và các luồng AI sẽ
 * thêm sau.
 */
export const createMockGeminiService = (
  overrides: Partial<{
    text: string;
    band: number;
    feedback: string;
  }> = {},
) => ({
  generateContent: jest.fn().mockResolvedValue({
    text: overrides.text ?? 'mock gemini response',
  }),
  gradeWriting: jest.fn().mockResolvedValue({
    band: overrides.band ?? 6.5,
    feedback: overrides.feedback ?? 'mock writing feedback',
  }),
  gradeSpeaking: jest.fn().mockResolvedValue({
    band: overrides.band ?? 6.0,
    feedback: overrides.feedback ?? 'mock speaking feedback',
  }),
});

/**
 * Mock email service (OTP, welcome, notification). Hiện chưa có module email
 * trong backend-core nhưng test-case TC01 trong testing-sample.md yêu cầu OTP,
 * nên giữ factory này sẵn để override khi triển khai.
 */
export const createMockEmailService = () => ({
  sendOtp: jest.fn().mockResolvedValue(undefined),
  verifyOtp: jest.fn().mockResolvedValue(true),
  sendWelcome: jest.fn().mockResolvedValue(undefined),
  sendNotification: jest.fn().mockResolvedValue(undefined),
});

/**
 * Mock STT (Whisper). Trả về transcription cố định.
 */
export const createMockSttService = (
  overrides: Partial<{
    text: string;
    confidence: number;
  }> = {},
) => ({
  transcribe: jest.fn().mockResolvedValue({
    text: overrides.text ?? 'hello world',
    words: [
      {
        word: 'hello',
        start: 0,
        end: 0.5,
        probability: overrides.confidence ?? 0.95,
      },
      {
        word: 'world',
        start: 0.5,
        end: 1.0,
        probability: overrides.confidence ?? 0.92,
      },
    ],
    language: 'en',
  }),
});

/**
 * Mock TTS (text-to-speech). Trả về buffer giả.
 */
export const createMockTtsService = () => ({
  synthesize: jest.fn().mockResolvedValue(Buffer.from('mock-audio-bytes')),
});

/**
 * Mock OAuth2Client (google-auth-library). Dùng để giả lập verifyIdToken khi
 * test luồng Google OAuth login.
 */
export const createMockGoogleOAuthClient = (
  payload: Partial<{
    sub: string;
    email: string;
    given_name: string;
    family_name: string;
    picture: string;
    aud: string;
  }> = {},
) => ({
  verifyIdToken: jest.fn().mockResolvedValue({
    getPayload: () => ({
      sub: payload.sub ?? 'google-test-sub',
      email: payload.email ?? 'test-google@example.com',
      given_name: payload.given_name ?? 'Google',
      family_name: payload.family_name ?? 'Test',
      picture: payload.picture ?? 'https://example.com/avatar.png',
      aud:
        payload.aud ??
        process.env.GOOGLE_CLIENT_ID ??
        'test-google-client-id.apps.googleusercontent.com',
    }),
  }),
});

// ─────────────────────────────────────────────────────────────
// App bootstrap
// ─────────────────────────────────────────────────────────────

/**
 * Khởi tạo NestJS testing module + INestApplication có sẵn các global pipe
 * và prefix như production.
 *
 * Mặc định mock:
 *   - AiClientService (không kết nối RabbitMQ)
 *   - StorageService (không gọi Cloudinary)
 *
 * Truyền `overrides` để inject thêm mock (vd: EmailService, GeminiService).
 *
 * Lưu ý: trước khi import file này, `setup-e2e.ts` phải đã chạy để load
 * `.env.test` vào process.env (đảm bảo `DATABASE_URL` trỏ về schema test,
 * `JWT_SECRET` được set, v.v.).
 */
export async function createTestingApp(
  options: CreateTestingAppOptions = {},
): Promise<TestContext> {
  const builder = Test.createTestingModule({
    imports: [AppModule],
  });

  if (!options.disableDefaultMocks) {
    builder
      .overrideProvider(AiClientService)
      .useValue(createMockAiClientService())
      .overrideProvider(StorageService)
      .useValue(createMockStorageService());
  }

  for (const o of options.overrides ?? []) {
    builder.overrideProvider(o.provide).useValue(o.useValue);
  }

  const moduleRef = await builder.compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  return {
    app,
    moduleRef,
    prisma: moduleRef.get(PrismaService),
    jwt: moduleRef.get(JwtService, { strict: false }),
  };
}

/**
 * Tear-down INestApplication + ngắt Prisma. Gọi trong `afterAll`.
 */
export async function shutdownTestingApp(ctx: TestContext): Promise<void> {
  try {
    await ctx.prisma.$disconnect();
  } catch {
    /* ignore */
  }
  await ctx.app.close();
}

// ─────────────────────────────────────────────────────────────
// Database reset
// ─────────────────────────────────────────────────────────────

/**
 * TRUNCATE toàn bộ bảng trong schema hiện tại (current_schema()) với
 * RESTART IDENTITY CASCADE. Bảng `_prisma_migrations` được bỏ qua để giữ
 * trạng thái migration.
 *
 * QUAN TRỌNG: hàm này dựa vào `?schema=test` trong DATABASE_URL của
 * .env.test để KHÔNG bao giờ chạm vào schema "public" của production.
 */
export async function resetDatabase(prisma: PrismaService): Promise<void> {
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = current_schema()
  `;

  const targets = tables
    .map((t) => t.tablename)
    .filter((name) => name !== '_prisma_migrations');

  if (targets.length === 0) return;

  const quoted = targets.map((name) => `"${name}"`).join(', ');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE;`,
  );
}

// ─────────────────────────────────────────────────────────────
// Test users + JWT
// ─────────────────────────────────────────────────────────────

const DEFAULT_TEST_PASSWORD = 'TestPassword123!';

function uniqueEmail(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

/**
 * Tạo một User trực tiếp qua Prisma (bypass /auth/register) và trả về JWT
 * đã ký sẵn. JWT payload khớp với AuthService.login() hiện tại:
 *   { email, sub: userId, role }
 */
export async function createTestUser(
  prisma: PrismaService,
  jwt: JwtService,
  opts: CreateTestUserOptions = {},
): Promise<TestUser> {
  const password = opts.password ?? DEFAULT_TEST_PASSWORD;
  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: opts.email ?? uniqueEmail(opts.role?.toLowerCase() ?? 'student'),
      password: hashed,
      firstName: opts.firstName ?? 'Test',
      lastName: opts.lastName ?? 'User',
      role: opts.role ?? 'STUDENT',
      isActive: opts.isActive ?? true,
    },
  });

  const token = jwt.sign({
    email: user.email,
    sub: user.id,
    role: user.role,
  });

  return {
    id: user.id,
    email: user.email,
    password,
    token,
    authHeader: `Bearer ${token}`,
    role: user.role as UserRole,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

/**
 * Helper viết tắt: tạo user role ADMIN.
 */
export function createAdminUser(
  prisma: PrismaService,
  jwt: JwtService,
  opts: Omit<CreateTestUserOptions, 'role'> = {},
): Promise<TestUser> {
  return createTestUser(prisma, jwt, { ...opts, role: 'ADMIN' });
}

/**
 * Helper viết tắt: tạo user role INSTRUCTOR.
 */
export function createInstructorUser(
  prisma: PrismaService,
  jwt: JwtService,
  opts: Omit<CreateTestUserOptions, 'role'> = {},
): Promise<TestUser> {
  return createTestUser(prisma, jwt, { ...opts, role: 'INSTRUCTOR' });
}

// ─────────────────────────────────────────────────────────────
// Aggregate export: bundle mặc định cho beforeEach
// ─────────────────────────────────────────────────────────────

export const defaultMocks = {
  aiClient: createMockAiClientService,
  storage: createMockStorageService,
  gemini: createMockGeminiService,
  email: createMockEmailService,
  stt: createMockSttService,
  tts: createMockTtsService,
  googleOAuth: createMockGoogleOAuthClient,
};
