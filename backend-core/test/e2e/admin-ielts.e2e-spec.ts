import * as request from 'supertest';
import { INestApplication, HttpStatus } from '@nestjs/common';
import {
  createTestingApp,
  shutdownTestingApp,
  resetDatabase,
  TestContext,
} from '../helpers/test-setup';
import { ContentImportStatus, ContentImportSkill, ContentImportTargetSystem } from '@prisma/client';
import { randomUUID, createHmac } from 'crypto';
import { ExamsService } from '../../src/modules/exams/exams.service';
import { AiClientService } from '../../src/modules/ai-client/ai-client.service';

const BASE = '/api/v1';

describe('IELTS Admin API E2E & Golden Tests — schema=test', () => {
  let ctx: TestContext;
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    ctx = await createTestingApp();
    app = ctx.app;

    // Clean test schema
    await resetDatabase(ctx.prisma);

    // Create a mock admin user and sign a JWT token
    const adminUser = await ctx.prisma.user.create({
      data: {
        email: `admin-e2e-${Date.now()}@example.com`,
        password: 'AdminSecurePassword123!',
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });

    adminToken = ctx.jwt.sign({
      email: adminUser.email,
      sub: adminUser.id,
      role: 'ADMIN',
    });
  });

  afterAll(async () => {
    await shutdownTestingApp(ctx);
  });

  // ===================================================================
  // 1. GRADER-COMPATIBILITY VALIDATION (assertGraderCompatible)
  // ===================================================================
  describe('TC_E2E_07_01 — assertGraderCompatible Validation Rules', () => {
    it('should throw 422 Unprocessable Entity if question type is not in the whitelist', async () => {
      const job = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: ctx.jwt.decode(adminToken).sub,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.AWAITING_REVIEW,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 1 },
          structuredJson: {
            title: 'Invalid Type Test',
            content: [
              {
                question_number: 1,
                type: 'non_existent_type', // Invalid type
                question_text: 'Hello world',
                answer: 'gut',
              },
            ],
          },
        },
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: false, isPublished: false })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(res.body.message).toMatch(/Invalid question type/i);
    });

    it('should throw 422 if parentheses optional formats are unbalanced', async () => {
      const job = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: ctx.jwt.decode(adminToken).sub,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.AWAITING_REVIEW,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 1 },
          structuredJson: {
            title: 'Unbalanced Parentheses Test',
            content: [
              {
                question_number: 1,
                type: 'sentence_completion',
                question_text: 'The color is ___',
                answer: 'colo(u(r', // Malformed parentheses
              },
            ],
          },
        },
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: false, isPublished: false })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(res.body.message).toMatch(/Unbalanced parentheses/i);
    });

    it('should throw 422 if answer has double slashes or malformed slashes', async () => {
      const job = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: ctx.jwt.decode(adminToken).sub,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.AWAITING_REVIEW,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 1 },
          structuredJson: {
            title: 'Malformed Slash Test',
            content: [
              {
                question_number: 1,
                type: 'sentence_completion',
                question_text: 'The spelling is ___',
                answer: 'color//colour', // Double slash
              },
            ],
          },
        },
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: false, isPublished: false })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);

      expect(res.body.message).toMatch(/Invalid slash formatting/i);
    });
  });

  // ===================================================================
  // 2. STAGING COMMITS & DUPLICATION PREVENTIONS
  // ===================================================================
  describe('TC_E2E_07_02 — Staging Commits & Provenance Duplication Blocks', () => {
    it('should successfully commit an Intensive mock exam to live table', async () => {
      const job = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: ctx.jwt.decode(adminToken).sub,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.AWAITING_REVIEW,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com',
          provenance: { source: 'cambridge', bookNumber: 20, testNumber: 1 },
          structuredJson: {
            title: 'Cambridge Reading Test 20-1',
            description: 'E2E Commit Test',
            duration: 60,
            difficulty: 'advanced',
            content: [
              {
                question_number: 1,
                type: 'sentence_completion',
                question_text: 'The development of ___ is vital.',
                answer: 'violins',
              },
            ],
          },
        },
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: false, isPublished: false })
        .expect(HttpStatus.CREATED);

      expect(res.text).toBeDefined();
      const examId = res.text;

      // Assert database record exists in IeltsIntensiveExam
      const exam = await ctx.prisma.ieltsIntensiveExam.findUnique({
        where: { id: examId },
      });
      expect(exam).not.toBeNull();
      expect(exam!.title).toBe('Cambridge Reading Test 20-1');
      expect(exam!.source).toBe('cambridge');
      expect(exam!.bookNumber).toBe(20);
      expect(exam!.isPublished).toBe(false); // Default isPublished must be false on commit
    });

    it('should block commits (409 Conflict) when duplicates exist and overwrite is false', async () => {
      const duplicateJob = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: ctx.jwt.decode(adminToken).sub,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.AWAITING_REVIEW,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com',
          provenance: { source: 'cambridge', bookNumber: 20, testNumber: 1 }, // Already committed in previous test
          structuredJson: {
            title: 'Cambridge Reading Test 20-1', // Same title & type
            content: [
              {
                question_number: 1,
                type: 'sentence_completion',
                question_text: 'Duplicate question text',
                answer: 'violins',
              },
            ],
          },
        },
      });

      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${duplicateJob.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: false })
        .expect(HttpStatus.CONFLICT);

      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should successfully commit and overwrite existing record when overwrite is true', async () => {
      const duplicateJob = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: ctx.jwt.decode(adminToken).sub,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.AWAITING_REVIEW,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com',
          provenance: { source: 'cambridge', bookNumber: 20, testNumber: 1 },
          structuredJson: {
            title: 'Cambridge Reading Test 20-1',
            description: 'Overwritten Description',
            content: [
              {
                question_number: 1,
                type: 'sentence_completion',
                question_text: 'Overwritten question text',
                answer: 'violins',
              },
            ],
          },
        },
      });

      await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${duplicateJob.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: true })
        .expect(HttpStatus.CREATED);

      // Verify that description is overwritten in the live exam
      const overwritten = await ctx.prisma.ieltsIntensiveExam.findFirst({
        where: { source: 'cambridge', bookNumber: 20, testNumber: 1 },
      });
      expect(overwritten!.description).toBe('Overwritten Description');
    });
  });

  // ===================================================================
  // 3. FULL_TEST GROUP COMPILE
  // ===================================================================
  describe('TC_E2E_07_03 — FULL_TEST Group Merging Logic', () => {
    it('should merge 4 completed skills inside a group into a single IeltsIntensiveExam of type FULL_TEST', async () => {
      const groupId = randomUUID();
      const adminId = ctx.jwt.decode(adminToken).sub;

      // Seed 4 staging jobs representing Listening, Reading, Writing, Speaking
      const skills = [
        ContentImportSkill.LISTENING,
        ContentImportSkill.READING,
        ContentImportSkill.WRITING,
        ContentImportSkill.SPEAKING,
      ];

      const jobs = [];
      for (const s of skills) {
        const job = await ctx.prisma.contentImportJob.create({
          data: {
            createdById: adminId,
            targetSystem: ContentImportTargetSystem.INTENSIVE,
            skill: s,
            groupId,
            status: ContentImportStatus.AWAITING_REVIEW,
            sourceType: 'WEB_URL',
            sourceRef: 'https://example.com',
            provenance: { source: 'cambridge', bookNumber: 18, testNumber: 2 },
            structuredJson: {
              title: `Cambridge 18 Test 2 - ${s}`,
              passage: s === ContentImportSkill.READING ? 'Reading passage content' : undefined,
              transcript: s === ContentImportSkill.LISTENING ? [{ speaker: 'Man', text: 'Spoken text' }] : undefined,
              prompt: s === ContentImportSkill.WRITING ? 'Write about something' : undefined,
              questions: s === ContentImportSkill.SPEAKING ? [{ text: 'Question text' }] : undefined,
              content: (s === ContentImportSkill.LISTENING || s === ContentImportSkill.READING) ? [
                {
                  question_number: 1,
                  type: 'sentence_completion',
                  question_text: 'Dummy question',
                  answer: 'test',
                },
              ] : undefined,
            },
          },
        });
        jobs.push(job);
      }

      // Mark all jobs as committed individual drafts
      for (const j of jobs) {
        await ctx.prisma.contentImportJob.update({
          where: { id: j.id },
          data: { status: ContentImportStatus.COMMITTED },
        });
      }

      // Commit group
      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/group/${groupId}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: false })
        .expect(HttpStatus.CREATED);

      expect(res.body.examIds).toBeDefined();
      expect(res.body.examIds.length).toBe(1);

      const mergedExamId = res.body.examIds[0];

      // Verify the FULL_TEST exam is correctly generated and populated
      const fullTest = await ctx.prisma.ieltsIntensiveExam.findUnique({
        where: { id: mergedExamId },
      });
      expect(fullTest).not.toBeNull();
      expect(fullTest!.type).toBe('FULL_TEST');
      expect(fullTest!.bookNumber).toBe(18);
      expect(fullTest!.testNumber).toBe(2);
      
      const qBlob = fullTest!.questions as any;
      expect(qBlob.type).toBe('full_test');
      expect(qBlob.listening).toBeDefined();
      expect(qBlob.reading).toBeDefined();
      expect(qBlob.writing).toBeDefined();
      expect(qBlob.speaking).toBeDefined();
    });
  });

  // ===================================================================
  // 4. PARSE IELTS ANSWER DIRECT NORMALIZATION
  // ===================================================================
  describe('TC_E2E_07_04 — parseIELTSAnswer Normalization Rules', () => {
    let examsService: ExamsService;

    beforeAll(() => {
      examsService = app.get(ExamsService);
    });

    it('should parse single exact string correctly (lowercase + alphanumeric only)', () => {
      const parsed = (examsService as any).parseIELTSAnswer('apple');
      expect(parsed).toEqual(['apple']);
    });

    it('should parse slash alternatives correctly', () => {
      const parsed = (examsService as any).parseIELTSAnswer('apple / banana');
      expect(parsed).toEqual(['apple', 'banana']);
    });

    it('should parse optional parentheses correctly', () => {
      const parsed = (examsService as any).parseIELTSAnswer('colo(u)r');
      expect(parsed).toEqual(['color', 'colour']);
    });

    it('should parse optional parentheses and slash alternatives combined correctly', () => {
      const parsed = (examsService as any).parseIELTSAnswer('travel(l)ing / journey');
      expect(parsed).toEqual(['traveling', 'travelling', 'journey']);
    });

    it('should strip special characters and spaces correctly', () => {
      const parsed = (examsService as any).parseIELTSAnswer(' A-B_C. ');
      expect(parsed).toEqual(['abc']);
    });

    it('should handle case insensitivity by converting all outputs to lowercase', () => {
      const parsed = (examsService as any).parseIELTSAnswer('ApPlE');
      expect(parsed).toEqual(['apple']);
    });
  });

  // ===================================================================
  // 5. FULL GOLDEN GRADING TEST (LISTENING & READING)
  // ===================================================================
  describe('TC_E2E_07_05 — Full Golden Grading Test (Listening & Reading)', () => {
    it('should commit an exam with gap-fillings, take it, grade with perfect marks, and return COMPLETED', async () => {
      const adminId = ctx.jwt.decode(adminToken).sub;

      // 1. Create a staging job for a realistic mock Reading exam
      const job = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: adminId,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.AWAITING_REVIEW,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com/cambridge-17-test-1',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 1 },
          structuredJson: {
            title: 'Cambridge 17 Reading Test 1',
            description: 'Golden Test Reading Exam',
            duration: 60,
            difficulty: 'advanced',
            content: [
              {
                question_number: 1,
                type: 'sentence_completion',
                question_text: 'The color of the violin was ___',
                answer: 'colo(u)r',
              },
              {
                question_number: 2,
                type: 'short_answer',
                question_text: 'What was the transport mode?',
                answer: 'car / taxi',
              },
              {
                question_number: 3,
                type: 'fill_blank',
                question_text: 'Write A B C: ___',
                answer: 'A B C',
              },
              {
                question_numbers: [4, 5],
                type: 'multiple_choice_multiple',
                question_text: 'Select two materials:',
                correct_answers: ['wood', 'metal'],
              }
            ],
          },
        },
      });

      // 2. Commit the staging job to live tables
      const commitRes = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: true, isPublished: true })
        .expect(HttpStatus.CREATED);

      const examId = commitRes.text;
      expect(examId).toBeDefined();

      // 3. Create a student user and start an exam session
      const student = await ctx.prisma.user.create({
        data: {
          email: `student-e2e-${Date.now()}@example.com`,
          password: 'StudentSecurePassword123!',
          firstName: 'John',
          lastName: 'Doe',
          role: 'STUDENT',
        },
      });

      const studentToken = ctx.jwt.sign({
        email: student.email,
        sub: student.id,
        role: 'STUDENT',
      });

      const startRes = await request(app.getHttpServer())
        .post(`${BASE}/exams/${examId}/sessions`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ userId: student.id })
        .expect(HttpStatus.CREATED);

      const sessionId = startRes.body.id;
      expect(sessionId).toBeDefined();

      // 4. Submit answers with various alternative forms and spelling normalizations:
      // - Question 1 correct answers are 'color' or 'colour'. Student submits 'colour'.
      // - Question 2 correct answers are 'car' or 'taxi'. Student submits 'TAXI'.
      // - Question 3 correct answer is 'A B C' (normalized to 'abc'). Student submits 'a-b-c'.
      // - Questions 4,5 correct answers are 'wood' and 'metal'. Student submits 'wood' for 4 and 'metal' for 5.
      const submitAnswers = {
        '1': 'colour',
        '2': 'TAXI',
        '3': 'a-b-c',
        '4': 'wood',
        '5': 'metal',
      };

      const submitRes = await request(app.getHttpServer())
        .post(`${BASE}/exams/sessions/${sessionId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: submitAnswers })
        .expect(HttpStatus.CREATED);

      expect(submitRes.body.status).toBe('COMPLETED');
      
      // Let's retrieve the result from the DB
      const result = await ctx.prisma.ieltsIntensiveResult.findUnique({
        where: { sessionId },
      });
      
      expect(result).not.toBeNull();
      // Total questions graded = 5.
      // Question 1, 2, 3: single score.
      // Questions 4,5: multi-select matching 2 correct -> score +2.
      // TotalScore should be 5 out of 5!
      expect(result!.totalScore).toBe(5);
    });
  });

  // ===================================================================
  // 4. PHASE 8: HARDENING & OPERATIONAL SERVICES
  // ===================================================================
  describe('TC_E2E_08_01 — Phase 8 Hardening Services', () => {
    it('should block import jobs if 24h Gemini token quota budget is reached (Cost Guard)', async () => {
      // 1. Create a job that consumed the budget
      await ctx.prisma.contentImportJob.create({
        data: {
          createdById: ctx.jwt.decode(adminToken).sub,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.COMMITTED,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com/cost-guard',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 1 },
          tokensUsed: 10000000, // consumes 10M tokens (the default limit)
          structuredJson: {},
        },
      });

      // 2. Try to create another import job and expect Bad Request block
      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.LISTENING,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com/blocked-job',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 1 },
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(res.body.message).toMatch(/budget safety guard/i);
    });

    it('should successfully record audit logs for admin actions', async () => {
      // Clean previous audit logs for clean assertion
      await ctx.prisma.adminAuditLog.deleteMany({});

      const job = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: ctx.jwt.decode(adminToken).sub,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.AWAITING_REVIEW,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com/audit-test',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 2 },
          structuredJson: {
            title: 'Audit Logging Test Exam',
            duration: 60,
            content: [
              {
                question_number: 1,
                type: 'sentence_completion',
                question_text: 'The answer is ___',
                answer: 'yes',
              },
            ],
          },
        },
      });

      // Save Draft should log UPDATE_DRAFT
      await request(app.getHttpServer())
        .patch(`${BASE}/admin/ielts/import/${job.id}/draft`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          version: 0,
          structuredJson: job.structuredJson,
          provenance: job.provenance,
        })
        .expect(HttpStatus.OK);

      // Commit should log COMMIT
      const commitRes = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: true, isPublished: false })
        .expect(HttpStatus.CREATED);

      const examId = commitRes.text;

      // Delete Exam should log DELETE and clear media assets
      await request(app.getHttpServer())
        .delete(`${BASE}/admin/ielts/intensive/${examId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(HttpStatus.OK);

      // Check that audit logs were recorded
      const logs = await ctx.prisma.adminAuditLog.findMany({
        orderBy: { createdAt: 'asc' },
      });

      expect(logs.length).toBeGreaterThanOrEqual(3);

      const draftLog = logs.find((l) => l.action === 'UPDATE_DRAFT');
      expect(draftLog).toBeDefined();
      expect(draftLog!.entityType).toBe('IMPORT_JOB');
      expect(draftLog!.entityId).toBe(job.id);

      const commitLog = logs.find((l) => l.action === 'COMMIT');
      expect(commitLog).toBeDefined();
      expect(commitLog!.entityType).toBe('INTENSIVE_EXAM');
      expect(commitLog!.entityId).toBe(examId);

      const deleteLog = logs.find((l) => l.action === 'DELETE');
      expect(deleteLog).toBeDefined();
      expect(deleteLog!.entityType).toBe('INTENSIVE_EXAM');
      expect(deleteLog!.entityId).toBe(examId);
    });

    it('should successfully recover stuck jobs and discard expired Full Test groups via ImportCronService', async () => {
      // 1. Resolve dependencies manually to test the Cron Service
      const { ImportCronService } = require('../../src/modules/admin-ielts/services/import-cron.service');
      const cronService = app.get(ImportCronService);

      const userId = ctx.jwt.decode(adminToken).sub;

      // Create a stuck job: SCRAPING, started 1 hour ago
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const stuckJob = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: userId,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.SCRAPING,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com/stuck',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 1 },
          processingStartedAt: oneHourAgo,
          structuredJson: {},
        },
      });

      // Create an expired zombie group job: PENDING, groupExpiresAt 1 hour ago
      const expiredGroupJob = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: userId,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.LISTENING,
          status: ContentImportStatus.PENDING,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com/zombie',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 1 },
          groupId: 'expired-group-uuid',
          groupExpiresAt: oneHourAgo,
          structuredJson: {},
        },
      });

      // Run the cron routine manually!
      await cronService.handleStuckJobs();

      // Retrieve and assert both jobs are recovered/cleaned up
      const recoveredJob = await ctx.prisma.contentImportJob.findUnique({
        where: { id: stuckJob.id },
      });
      expect(recoveredJob!.status).toBe(ContentImportStatus.FAILED);
      expect(recoveredJob!.error).toContain('Processing timeout');

      const cleanedGroupJob = await ctx.prisma.contentImportJob.findUnique({
        where: { id: expiredGroupJob.id },
      });
      expect(cleanedGroupJob!.status).toBe(ContentImportStatus.DISCARDED);
      expect(cleanedGroupJob!.error).toContain('Group TTL expired');
    });

    it('should successfully verify webhook callbacks on rawBody signature and fail on bad HMAC signatures (BUG-01 & BUG-02)', async () => {
      const adminId = ctx.jwt.decode(adminToken).sub;
      const job = await ctx.prisma.contentImportJob.create({
        data: {
          createdById: adminId,
          targetSystem: ContentImportTargetSystem.INTENSIVE,
          skill: ContentImportSkill.READING,
          status: ContentImportStatus.PENDING,
          sourceType: 'WEB_URL',
          sourceRef: 'https://example.com/hmac-test',
          provenance: { source: 'cambridge', bookNumber: 17, testNumber: 3 },
          structuredJson: {},
        },
      });

      const secret = process.env.CALLBACK_SECRET || 'test-callback-secret-value-for-ci';
      const callbackPayload = {
        structuredJson: {
          title: 'HMAC non-ASCII café – test',
          passage: 'Passage',
          content: [
            {
              question_number: 1,
              type: 'sentence_completion',
              question_text: 'The answer is ___',
              answer: 'yes',
            },
          ],
        },
      };

      const payloadStr = JSON.stringify(callbackPayload);
      const signature = createHmac('sha256', secret).update(Buffer.from(payloadStr)).digest('hex');

      // Valid signature -> OK 201
      await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job.id}/extracted`)
        .set('x-callback-signature', signature)
        .send(callbackPayload)
        .expect(HttpStatus.CREATED);

      // Invalid signature -> Unauthorized 401
      await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job.id}/extracted`)
        .set('x-callback-signature', 'invalid-hmac-signature-here')
        .send(callbackPayload)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should prevent group commits if any job has FAILED (BUG-04) and enforce individual commit locks', async () => {
      const groupId = randomUUID();
      const adminId = ctx.jwt.decode(adminToken).sub;

      const jobs = [];
      const skills = [ContentImportSkill.LISTENING, ContentImportSkill.READING];
      for (let i = 0; i < skills.length; i++) {
        const s = skills[i];
        const job = await ctx.prisma.contentImportJob.create({
          data: {
            createdById: adminId,
            targetSystem: ContentImportTargetSystem.INTENSIVE,
            skill: s,
            groupId,
            status: i === 0 ? ContentImportStatus.AWAITING_REVIEW : ContentImportStatus.FAILED,
            sourceType: 'WEB_URL',
            sourceRef: 'https://example.com/fail-test',
            provenance: { source: 'cambridge', bookNumber: 18, testNumber: 3 },
            structuredJson: {
              title: `Fail Group ${s}`,
              content: [{ question_number: 1, type: 'sentence_completion', answer: 'test' }],
            },
          },
        });
        jobs.push(job);
      }

      // Group commit should block with 409 Conflict due to FAILED status
      await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/group/${groupId}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: false })
        .expect(HttpStatus.CONFLICT);

      // Manual per-job commit on group-linked job should block with 409 Conflict
      await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${jobs[0].id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: true })
        .expect(HttpStatus.CONFLICT);
    });

    it('should synchronously grade FULL_TEST Listening/Reading sub-sections and create structured result records (BUG-05, BUG-06 & BUG-07)', async () => {
      const groupId = randomUUID();
      const adminId = ctx.jwt.decode(adminToken).sub;

      // Seed 4 staging jobs representing Listening, Reading, Writing, Speaking
      const skills = [
        ContentImportSkill.LISTENING,
        ContentImportSkill.READING,
        ContentImportSkill.WRITING,
        ContentImportSkill.SPEAKING,
      ];

      const jobs = [];
      for (const s of skills) {
        const job = await ctx.prisma.contentImportJob.create({
          data: {
            createdById: adminId,
            targetSystem: ContentImportTargetSystem.INTENSIVE,
            skill: s,
            groupId,
            status: ContentImportStatus.AWAITING_REVIEW,
            sourceType: 'WEB_URL',
            sourceRef: 'https://example.com/fulltest-grading',
            provenance: { source: 'cambridge', bookNumber: 19, testNumber: 1 },
            structuredJson: {
              title: `Grading Group ${s}`,
              // BUG-07: Testing matching extraction in Listening Part
              answers: s === ContentImportSkill.LISTENING ? { '1': { letter: 'A' }, '2': 'B' } : undefined,
              type: s === ContentImportSkill.LISTENING ? 'matching' : undefined,
              // BUG-07: Testing table completion in Reading Part
              rows: s === ContentImportSkill.READING ? [
                {
                  questions: {
                    '3': { answer: 'yes' },
                    '4': { answer: 'no' }
                  }
                }
              ] : undefined,
              prompt: s === ContentImportSkill.WRITING ? 'Write essay' : undefined,
              questions: s === ContentImportSkill.SPEAKING ? [{ text: 'Question 1' }] : undefined,
            },
          },
        });
        jobs.push(job);
      }

      // Group commit to compile the FULL_TEST mock exam
      const mergeRes = await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/group/${groupId}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: true })
        .expect(HttpStatus.CREATED);

      const examId = mergeRes.body.examIds[0];
      expect(examId).toBeDefined();

      // Create a student exam session on the FULL_TEST
      const student = await ctx.prisma.user.create({
        data: {
          email: `fulltest-student-${Date.now()}@example.com`,
          password: 'Password123!',
          firstName: 'Full',
          lastName: 'Tester',
          role: 'STUDENT',
        },
      });

      // Grant the student a PREMIUM subscription so they can submit writing answers!
      await ctx.prisma.subscription.create({
        data: {
          userId: student.id,
          tier: 'PREMIUM',
          status: 'ACTIVE',
        },
      });

      const studentToken = ctx.jwt.sign({
        email: student.email,
        sub: student.id,
        role: 'STUDENT',
      });

      const sessionRes = await request(app.getHttpServer())
        .post(`${BASE}/exams/${examId}/sessions`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ userId: student.id })
        .expect(HttpStatus.CREATED);

      const sessionId = sessionRes.body.id;

      // Submit answers:
      // - Lmatch:1 correct: A, student: A
      // - Lmatch:2 correct: B, student: B
      // - R3 correct: yes, student: yes
      // - R4 correct: no, student: maybe (wrong)
      // also include some writing answers starting with 'w'
      const studentAnswers = {
        'Lmatch:1': 'A',
        'Lmatch:2': 'B',
        'R3': 'yes',
        'R4': 'maybe',
        'w-task1': 'Writing task 1 content essay goes here...',
      };

      const submitRes = await request(app.getHttpServer())
        .post(`${BASE}/exams/sessions/${sessionId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers: studentAnswers })
        .expect(HttpStatus.CREATED);

      // Should be SUBMITTED since writing answers exist (requires AI grading)
      expect(submitRes.body.status).toBe('SUBMITTED');

      // Check results
      const result = await ctx.prisma.ieltsIntensiveResult.findUnique({
        where: { sessionId },
      });

      expect(result).not.toBeNull();
      // Listening Score: match:1 (correct), match:2 (correct) -> 2
      expect(result!.listeningScore).toBe(2);
      // Reading Score: 3 (correct), 4 (wrong) -> 1
      expect(result!.readingScore).toBe(1);
      // TotalScore (Listening + Reading synchronously) -> 3
      expect(result!.totalScore).toBe(3);

      // Verify that the writing/speaking AI grading task was published to the queue
      const aiClientService = app.get(AiClientService);
      expect(aiClientService.publishGradingTask).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId,
          examType: 'FULL_TEST',
          answers: studentAnswers,
        })
      );
    });

    it('should enforce composite duplicate blocks on Writing/Speaking prompts when engnovateSlug is null (BUG-08)', async () => {
      const adminId = ctx.jwt.decode(adminToken).sub as string;

      const jobData = {
        createdById: adminId,
        targetSystem: ContentImportTargetSystem.ADVANCED,
        skill: ContentImportSkill.WRITING,
        status: ContentImportStatus.AWAITING_REVIEW,
        sourceType: 'WEB_URL',
        sourceRef: 'https://example.com/WS-duplicate',
        provenance: { source: 'forecast-ws', bookNumber: 0, testNumber: 99 },
        structuredJson: {
          title: 'Composite Duplicate Prompt',
          prompt: 'Write about duplicate blocks',
          taskType: 'TASK_2',
          engnovateSlug: null, // Null to trigger composite duplicate matching
        } as any,
      };

      // Create two identical jobs
      const job1 = await ctx.prisma.contentImportJob.create({ data: jobData as any });
      const job2 = await ctx.prisma.contentImportJob.create({ data: { ...jobData, provenance: { ...jobData.provenance, source: 'forecast-ws' } } as any });

      // First commit should succeed
      await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job1.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: false })
        .expect(HttpStatus.CREATED);

      // Second commit of identical composite attributes should fail with 409 Conflict
      await request(app.getHttpServer())
        .post(`${BASE}/admin/ielts/import/${job2.id}/commit`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ overwrite: false })
        .expect(HttpStatus.CONFLICT);
    });
  });
});
