/**
 * TC_SUB — Subscriptions (VNPay + Business Logic)
 * File 1: HTTP integration tests — VNPay IPN webhook
 *
 * Uses real SubscriptionsService + real controller; PAYMENT_PROVIDER,
 * PrismaService, and NotificationsService are all mocked in-process.
 *
 * Why real service instead of mocked: we want to exercise the full IPN
 * branching logic (txnRef check → hash check → response-code check →
 * session lookup → idempotency) while keeping external I/O (Redis, DB,
 * VNPay) offline.
 *
 * VNPay IPN spec: the endpoint ALWAYS returns HTTP 200 with a JSON body
 * { RspCode, Message }.  RspCode "97" = bad hash (VNPay will retry),
 * RspCode "00" = terminal success/fail, RspCode "02" = already processed.
 * The tests assert on RspCode rather than HTTP status.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as request from 'supertest';

import { SubscriptionsController } from '../subscriptions.controller';
import { SubscriptionsService } from '../subscriptions.service';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

describe('TC_SUB — Subscriptions (VNPay + Business Logic)', () => {
  describe('GET /api/v1/subscriptions/webhook/vnpay (IPN)', () => {
    let app: INestApplication;
    let prismaMock: any;
    let mockNotifications: any;
    let mockPaymentProvider: any;

    // Shared fixtures
    const SESSION_DATA = {
      userId: 'user-tc-webhook',
      planId: 'plan-premium',
      amount: 99000, // VND (vnp_Amount = 99000 × 100 = 9 900 000)
      currency: 'VND',
      planName: 'Premium Monthly',
      providerSubId: 'vnp_sub_001',
    };

    const PLAN_DATA = {
      id: 'plan-premium',
      name: 'Premium Monthly',
      tier: 'PREMIUM',
      interval: 'month',
      priceAmount: 99000,
      currency: 'VND',
      isActive: true,
    };

    const SUB_DATA = {
      id: 'sub-tc-webhook',
      userId: 'user-tc-webhook',
      tier: 'PREMIUM',
      status: 'ACTIVE',
    };

    beforeAll(async () => {
      prismaMock = {
        subscription: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          upsert: jest.fn().mockResolvedValue(SUB_DATA),
        },
        pricingPlan: {
          findUnique: jest.fn().mockResolvedValue(PLAN_DATA),
        },
        payment: {
          create: jest.fn().mockResolvedValue({ id: 'pay-001', status: 'succeeded' }),
          findFirst: jest.fn().mockResolvedValue(null),
        },
        usageRecord: {
          findMany: jest.fn().mockResolvedValue([]),
          upsert: jest.fn(),
          update: jest.fn(),
        },
      };

      mockNotifications = { create: jest.fn().mockResolvedValue(undefined) };

      mockPaymentProvider = {
        verifyHash: jest.fn(),
        getSessionData: jest.fn(),
        verifyPayment: jest.fn(),
        createCheckout: jest.fn(),
        cancelSubscription: jest.fn().mockResolvedValue({ success: true }),
      };

      const moduleRef: TestingModule = await Test.createTestingModule({
        imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10_000 }])],
        controllers: [SubscriptionsController],
        providers: [
          SubscriptionsService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: NotificationsService, useValue: mockNotifications },
          { provide: 'PAYMENT_PROVIDER', useValue: mockPaymentProvider },
        ],
      })
        .overrideGuard(ThrottlerGuard)
        .useValue({ canActivate: () => true })
        .compile();

      app = moduleRef.createNestApplication();
      app.setGlobalPrefix('api/v1');
      await app.init();
    });

    afterAll(() => app.close());
    beforeEach(() => jest.clearAllMocks());

    // TC_SUB_01: HMAC-SHA512 verify — vnp_SecureHash sai → RspCode "97"
    // VNPay IPN spec: hash failure is signalled via RspCode "97" so VNPay can
    // retry; a raw HTTP 4xx would break the IPN protocol.
    it('TC_SUB_01: vnp_SecureHash sai secret → RspCode "97" (Fail checksum)', async () => {
      mockPaymentProvider.verifyHash.mockReturnValue(false);

      const res = await request(app.getHttpServer())
        .get('/api/v1/subscriptions/webhook/vnpay')
        .query({
          vnp_TxnRef: 'txn-tc01',
          vnp_Amount: '9900000',
          vnp_ResponseCode: '00',
          vnp_TransactionStatus: '00',
          vnp_SecureHash: 'deadbeef_invalid_hash',
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ RspCode: '97', Message: 'Fail checksum' });
      expect(mockPaymentProvider.verifyHash).toHaveBeenCalled();
      // Service must NOT proceed to session lookup or payment activation
      expect(mockPaymentProvider.getSessionData).not.toHaveBeenCalled();
      expect(prismaMock.payment.create).not.toHaveBeenCalled();
    });

    // TC_SUB_02: IPN thành công — vnp_ResponseCode=00, HMAC đúng
    //   → payment.create gọi với status "succeeded", subscription.upsert tier PREMIUM
    it('TC_SUB_02: IPN success (ResponseCode=00, HMAC đúng) → payment status "succeeded", subscription PREMIUM', async () => {
      mockPaymentProvider.verifyHash.mockReturnValue(true);
      // getSessionData is called twice: once in handleVnpayIpn, once in verifyCheckout
      mockPaymentProvider.getSessionData.mockResolvedValue(SESSION_DATA);
      mockPaymentProvider.verifyPayment.mockResolvedValue({
        success: true,
        providerPayId: 'TXN98765',
        amount: 99000,
        currency: 'VND',
      });
      prismaMock.pricingPlan.findUnique.mockResolvedValue(PLAN_DATA);
      prismaMock.subscription.upsert.mockResolvedValue(SUB_DATA);
      prismaMock.payment.create.mockResolvedValue({ id: 'pay-tc02', status: 'succeeded' });

      const res = await request(app.getHttpServer())
        .get('/api/v1/subscriptions/webhook/vnpay')
        .query({
          vnp_TxnRef: 'txn-tc02',
          vnp_Amount: '9900000', // 99000 × 100
          vnp_ResponseCode: '00',
          vnp_TransactionStatus: '00',
          vnp_TransactionNo: 'TXN98765',
          vnp_SecureHash: 'correct_hash_value',
        });

      expect(res.status).toBe(200);
      expect(res.body.RspCode).toBe('00');

      // Subscription activated with PREMIUM tier
      expect(prismaMock.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ tier: 'PREMIUM', status: 'ACTIVE' }),
        }),
      );

      // Payment record created with succeeded status
      expect(prismaMock.payment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'succeeded',
            providerPayId: 'TXN98765',
          }),
        }),
      );
    });

    // TC_SUB_03: IPN thất bại — vnp_ResponseCode=24 (user hủy thanh toán)
    //   → RspCode "00" (terminal, VNPay không retry), subscription KHÔNG được tạo
    it('TC_SUB_03: vnp_ResponseCode=24 (user cancel) → RspCode "00" non-success, payment.create không được gọi', async () => {
      mockPaymentProvider.verifyHash.mockReturnValue(true);

      const res = await request(app.getHttpServer())
        .get('/api/v1/subscriptions/webhook/vnpay')
        .query({
          vnp_TxnRef: 'txn-tc03',
          vnp_Amount: '9900000',
          vnp_ResponseCode: '24', // user cancel
          vnp_TransactionStatus: '02',
          vnp_SecureHash: 'correct_hash',
        });

      expect(res.status).toBe(200);
      expect(res.body.RspCode).toBe('00');
      expect(res.body.Message).toMatch(/non-success/i);

      // No activation should happen for failed payments
      expect(prismaMock.payment.create).not.toHaveBeenCalled();
      expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
    });

    // TC_SUB_04: Replay attack — IPN gửi lại sau khi đã xử lý
    //   → RspCode "02" (Order already confirmed), idempotent — payment.create không gọi lần 2
    it('TC_SUB_04: IPN replay (session đã xóa, payment đã tồn tại) → RspCode "02", không double-credit', async () => {
      mockPaymentProvider.verifyHash.mockReturnValue(true);
      // Session was already consumed (deleted from Redis) by the first IPN / Return URL
      mockPaymentProvider.getSessionData.mockResolvedValue(null);
      // Existing payment record confirms the first IPN was already processed
      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'pay-existing',
        providerPayId: 'TXN11111',
        status: 'succeeded',
      });

      const res = await request(app.getHttpServer())
        .get('/api/v1/subscriptions/webhook/vnpay')
        .query({
          vnp_TxnRef: 'txn-tc04',
          vnp_Amount: '9900000',
          vnp_ResponseCode: '00',
          vnp_TransactionStatus: '00',
          vnp_TransactionNo: 'TXN11111',
          vnp_SecureHash: 'correct_hash',
        });

      expect(res.status).toBe(200);
      expect(res.body.RspCode).toBe('02');
      expect(res.body.Message).toBe('Order already confirmed');

      // Critical: no second payment record created (no double-credit)
      expect(prismaMock.payment.create).not.toHaveBeenCalled();
      expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
    });

    // TC_SUB_05: Thiếu vnp_TxnRef → RspCode "99" (server error)
    it('TC_SUB_05: thiếu vnp_TxnRef → RspCode "99" (Missing txnRef)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/subscriptions/webhook/vnpay')
        .query({
          vnp_Amount: '9900000',
          vnp_ResponseCode: '00',
          vnp_SecureHash: 'some_hash',
          // vnp_TxnRef deliberately omitted
        });

      expect(res.status).toBe(200);
      expect(res.body.RspCode).toBe('99');
      expect(res.body.Message).toMatch(/Missing txnRef/i);

      // Short-circuit: verifyHash must NOT be called when txnRef is absent
      expect(mockPaymentProvider.verifyHash).not.toHaveBeenCalled();
    });
  });
});
