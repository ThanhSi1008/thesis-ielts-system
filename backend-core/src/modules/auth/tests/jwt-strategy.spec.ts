/**
 * jwt-strategy.spec.ts — Unit tests cho JwtStrategy (không qua HTTP server)
 *
 * TC_JWT_01: validate() với payload hợp lệ → { id, email, role }
 * TC_JWT_02: token ký bằng secret sai → passport.authenticate() từ chối → UnauthorizedException
 * TC_JWT_03: token expired (exp < now) → passport.authenticate() từ chối → UnauthorizedException
 * TC_JWT_04: token thiếu field sub → validate() trả id=undefined
 *            (TODO: nên throw UnauthorizedException khi hoàn thiện validate())
 * TC_JWT_05: token thiếu field role → validate() trả role=undefined
 *            (TODO: nên throw UnauthorizedException khi hoàn thiện validate())
 *
 * Chiến lược test:
 *   - TC_JWT_01, TC_JWT_04, TC_JWT_05: gọi strategy.validate() trực tiếp —
 *     test pure unit, không cần passport machinery.
 *   - TC_JWT_02, TC_JWT_03: sử dụng passport.authenticate() trên mock request
 *     (không có HTTP server) để kiểm tra tầng xác minh signature/expiry của
 *     passport-jwt. Token được ký bằng jsonwebtoken trực tiếp.
 *
 * TC_JWT_04/05 phản ánh hành vi hiện tại của validate() — trả object với
 * field undefined thay vì throw. Các test này đóng vai trò tài liệu hoá gap
 * cần vá: validate() nên kiểm tra sub và role trước khi trả về.
 */

import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jsonwebtoken from 'jsonwebtoken';
import * as passport from 'passport';

import { JwtStrategy } from '../strategies/jwt.strategy';

const SECRET = 'unit-test-jwt-secret-strategy';
const WRONG_SECRET = 'wrong-secret-tamper';

// ─────────────────────────────────────────────────────────────
// Helper: invoke passport authenticate trên mock request
// (không mở HTTP server — chỉ dùng passport module trực tiếp)
// ─────────────────────────────────────────────────────────────

function passportAuth(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const mockReq = { headers: { authorization: `Bearer ${token}` } };
    const mockRes = {};
    const mockNext = (err?: any) => { if (err) reject(err); };

    passport.authenticate(
      'jwt-unit',
      { session: false },
      (err: any, user: any, info: any) => {
        if (err) return reject(err);
        if (!user) {
          return reject(
            new UnauthorizedException(info?.message ?? 'Unauthorized'),
          );
        }
        resolve(user);
      },
    )(mockReq as any, mockRes as any, mockNext);
  });
}

// ─────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────

describe('JwtStrategy — Unit Tests (TC_JWT)', () => {
  let strategy: JwtStrategy;

  beforeAll(() => {
    const configService = {
      get: (key: string) => (key === 'JWT_SECRET' ? SECRET : undefined),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService);

    // Đăng ký strategy dưới tên riêng 'jwt-unit' để không xung đột
    // với passport instance toàn cục trong các spec khác
    passport.use('jwt-unit', strategy as any);
  });

  afterAll(() => {
    // Huỷ đăng ký để tránh leak sang test suite khác
    passport.unuse('jwt-unit');
  });

  // ──────────────────────────────────────────────────────────
  // TC_JWT_01
  // ──────────────────────────────────────────────────────────

  it('TC_JWT_01: payload hợp lệ → validate() trả { id, email, role }', async () => {
    const payload = {
      sub: 'user-jwt-01',
      email: 'jwt01@example.com',
      role: 'STUDENT',
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      id: 'user-jwt-01',
      email: 'jwt01@example.com',
      role: 'STUDENT',
    });
  });

  // ──────────────────────────────────────────────────────────
  // TC_JWT_02
  // ──────────────────────────────────────────────────────────

  it('TC_JWT_02: token ký bằng secret khác → passport từ chối → UnauthorizedException', async () => {
    const token = jsonwebtoken.sign(
      { sub: 'user-jwt-02', email: 'jwt02@example.com', role: 'STUDENT' },
      WRONG_SECRET,
    );

    await expect(passportAuth(token)).rejects.toThrow(UnauthorizedException);
  });

  // ──────────────────────────────────────────────────────────
  // TC_JWT_03
  // ──────────────────────────────────────────────────────────

  it('TC_JWT_03: token expired (exp 1 giờ trước) → passport từ chối → UnauthorizedException', async () => {
    const expiredToken = jsonwebtoken.sign(
      {
        sub: 'user-jwt-03',
        email: 'jwt03@example.com',
        role: 'STUDENT',
        exp: Math.floor(Date.now() / 1000) - 3600, // hết hạn 1 giờ trước
      },
      SECRET,
    );

    await expect(passportAuth(expiredToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // ──────────────────────────────────────────────────────────
  // TC_JWT_04
  // ──────────────────────────────────────────────────────────

  it('TC_JWT_04: payload thiếu field sub → id = undefined (TODO: nên throw UnauthorizedException)', async () => {
    // Hành vi hiện tại: validate() không kiểm tra sub — trả { id: undefined }
    // Hành vi mong muốn khi hoàn thiện: throw UnauthorizedException
    const payload = { email: 'jwt04@example.com', role: 'STUDENT' }; // không có sub

    const result = await strategy.validate(payload);

    expect(result.id).toBeUndefined();
    expect(result.email).toBe('jwt04@example.com');
    expect(result.role).toBe('STUDENT');
  });

  // ──────────────────────────────────────────────────────────
  // TC_JWT_05
  // ──────────────────────────────────────────────────────────

  it('TC_JWT_05: payload thiếu field role → role = undefined (TODO: nên throw UnauthorizedException)', async () => {
    // Hành vi hiện tại: validate() không kiểm tra role — trả { role: undefined }
    // Hành vi mong muốn khi hoàn thiện: throw UnauthorizedException
    const payload = { sub: 'user-jwt-05', email: 'jwt05@example.com' }; // không có role

    const result = await strategy.validate(payload);

    expect(result.id).toBe('user-jwt-05');
    expect(result.email).toBe('jwt05@example.com');
    expect(result.role).toBeUndefined();
  });
});
