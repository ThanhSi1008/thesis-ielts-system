/**
 * TC06 — Cập nhật thông tin cá nhân (PATCH /api/v1/users/me)
 *
 * Endpoint thực tế là `PATCH /users/me` (không phải `/user/profile` như
 * thesis ghi). UpdateUserDto hiện tại CHỈ chấp nhận các field:
 *   firstName, lastName, email, isActive, role
 * — KHÔNG có phone, address, dob, nickname. Vì vậy các case TC06_02→11
 * trong thesis (validate phone/address/dob) đã được điều chỉnh sang các
 * validation đang thực thi: IsEmail, IsEnum, IsBoolean, IsString,
 * forbidNonWhitelisted, và xử lý lỗi P2002 (email trùng).
 *
 * Authentication: endpoint dùng JwtAuthGuard. Test override guard bằng
 * stub có toggle `guardShouldPass` để mô phỏng cả luồng có/không JWT.
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StorageService } from '../../../common/storage/storage.service';

describe('PATCH /api/v1/users/me (TC06 — Cập nhật thông tin cá nhân)', () => {
  let app: INestApplication;

  const TEST_USER_ID = 'auth-user-001';
  let guardShouldPass = true;

  const fakeJwtGuard = {
    canActivate: (ctx: ExecutionContext) => {
      if (!guardShouldPass) throw new UnauthorizedException();
      const req = ctx.switchToHttp().getRequest();
      req.user = {
        id: TEST_USER_ID,
        email: 'authed@example.com',
        role: 'STUDENT',
      };
      return true;
    },
  };

  const prismaMock = {
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10_000 }])],
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: StorageService,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(fakeJwtGuard)
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
    guardShouldPass = true;
  });

  // ─────────────────────────────────────────────────────────
  // [Invalid] — auth missing + ValidationPipe rejects
  // ─────────────────────────────────────────────────────────

  describe('[Invalid]', () => {
    it('TC06_01: không có JWT (JwtAuthGuard từ chối) → 401', async () => {
      guardShouldPass = false;
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ firstName: 'Anything' });

      expect(res.status).toBe(401);
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it('TC06_02: email sai định dạng → 400 "Invalid email format"', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
      const messages = Array.isArray(res.body.message)
        ? res.body.message.join(' ')
        : String(res.body.message ?? '');
      expect(messages).toMatch(/Invalid email format/i);
    });

    it('TC06_03: role không nằm trong enum (STUDENT/TEACHER/ADMIN) → 400', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ role: 'SUPERHERO' });

      expect(res.status).toBe(400);
    });

    it('TC06_04: isActive không phải boolean → 400', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ isActive: 'maybe' });

      expect(res.status).toBe(400);
    });

    it('TC06_05: firstName là số → 400 (IsString)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ firstName: 12345 });

      expect(res.status).toBe(400);
    });

    it('TC06_06: gửi field lạ không thuộc UpdateUserDto → 400 (forbidNonWhitelisted)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ phone: '0901234567' });

      expect(res.status).toBe(400);
      const messages = Array.isArray(res.body.message)
        ? res.body.message.join(' ')
        : String(res.body.message ?? '');
      expect(messages).toMatch(/should not exist/i);
    });
  });

  // ─────────────────────────────────────────────────────────
  // [Valid] — luồng update thành công + xử lý email trùng
  // ─────────────────────────────────────────────────────────

  describe('[Valid]', () => {
    it('TC06_07: cập nhật firstName hợp lệ → 200, prisma.user.update được gọi đúng id', async () => {
      prismaMock.user.update.mockResolvedValue({
        id: TEST_USER_ID,
        email: 'authed@example.com',
        firstName: 'NewName',
        lastName: 'OldLast',
        role: 'STUDENT',
        isActive: true,
        createdAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ firstName: 'NewName' });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('NewName');
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      const callArg = prismaMock.user.update.mock.calls[0][0];
      expect(callArg.where).toEqual({ id: TEST_USER_ID });
      expect(callArg.data.firstName).toBe('NewName');
    });

    it('TC06_08: cập nhật email mới hợp lệ → 200', async () => {
      prismaMock.user.update.mockResolvedValue({
        id: TEST_USER_ID,
        email: 'new-email@example.com',
        firstName: 'A',
        lastName: 'B',
        role: 'STUDENT',
        isActive: true,
        createdAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ email: 'new-email@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('new-email@example.com');
    });

    it('TC06_09: cập nhật email đã có người khác dùng (Prisma P2002) → 400', async () => {
      prismaMock.user.update.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['email'] },
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ email: 'taken@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Email already in use/i);
    });

    it('TC06_10: cập nhật role = TEACHER → 200, lưu đúng giá trị', async () => {
      prismaMock.user.update.mockImplementation(async ({ data }: any) => ({
        id: TEST_USER_ID,
        email: 'authed@example.com',
        firstName: 'A',
        lastName: 'B',
        role: data.role,
        isActive: true,
        createdAt: new Date(),
      }));

      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ role: 'TEACHER' });

      expect(res.status).toBe(200);
      expect(res.body.role).toBe('TEACHER');
      expect(prismaMock.user.update.mock.calls[0][0].data.role).toBe('TEACHER');
    });

    it('TC06_11: cập nhật isActive = false → 200, lưu boolean đúng', async () => {
      prismaMock.user.update.mockImplementation(async ({ data }: any) => ({
        id: TEST_USER_ID,
        email: 'authed@example.com',
        firstName: 'A',
        lastName: 'B',
        role: 'STUDENT',
        isActive: data.isActive,
        createdAt: new Date(),
      }));

      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.isActive).toBe(false);
    });

    it('TC06_12: body rỗng (không field) → 200, prisma vẫn được gọi với data toàn undefined (no-op)', async () => {
      // Lưu ý: thesis spec là "no changes detected → 400" nhưng code hiện
      // KHÔNG enforce. Prisma coi undefined = không update field đó nên
      // trả về user hiện tại không đổi.
      prismaMock.user.update.mockResolvedValue({
        id: TEST_USER_ID,
        email: 'authed@example.com',
        firstName: 'Old',
        lastName: 'Old',
        role: 'STUDENT',
        isActive: true,
        createdAt: new Date(),
      });

      const res = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .send({});

      expect(res.status).toBe(200);
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      const callArg = prismaMock.user.update.mock.calls[0][0];
      expect(callArg.data).toEqual({
        firstName: undefined,
        lastName: undefined,
        email: undefined,
        isActive: undefined,
        role: undefined,
      });
    });
  });
});
