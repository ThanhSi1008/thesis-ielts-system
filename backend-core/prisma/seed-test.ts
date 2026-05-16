/**
 * prisma/seed-test.ts — Dữ liệu hạt giống (fixture) cho môi trường test.
 *
 * Mục tiêu:
 *   - **Idempotent**: chạy lại nhiều lần không gây lỗi (mọi entity dùng
 *     `upsert` với ID cố định).
 *   - **Tối thiểu nhưng đủ**: phủ các domain trọng yếu mà test cần — user
 *     (3 vai trò), IELTS exam, foundation vocab content, pricing plan,
 *     achievement.
 *   - **Không phụ thuộc trang đầy đủ `seed.ts`** — chạy nhanh trong CI.
 *
 * Chạy:
 *   cd backend-core
 *   npx ts-node prisma/seed-test.ts
 *
 *   # hoặc thông qua script npm (sẽ thêm trong package.json):
 *   npm run prisma:seed:test
 *
 * Yêu cầu: DATABASE_URL phải trỏ về schema test (không phải production).
 * Trong CI, GitHub Actions truyền biến môi trường này tới service container
 * postgres. Trong local dev, dùng giá trị trong `.env.test`.
 */

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────
// Stable IDs — để test có thể reference deterministic
// ─────────────────────────────────────────────────────────

export const TEST_IDS = {
  users: {
    admin: "00000000-0000-0000-0000-000000000001",
    student: "00000000-0000-0000-0000-000000000002",
    instructor: "00000000-0000-0000-0000-000000000003",
  },
  exams: {
    sampleListening: "10000000-0000-0000-0000-000000000001",
  },
  vocab: {
    book: "20000000-0000-0000-0000-000000000001",
    unit: "20000000-0000-0000-0000-000000000002",
    item: "20000000-0000-0000-0000-000000000003",
  },
  achievements: {
    firstLogin: "30000000-0000-0000-0000-000000000001",
  },
  plans: {
    premiumMonthly: "40000000-0000-0000-0000-000000000001",
  },
} as const;

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const TEST_PASSWORD = "TestPassword123!";

// ─────────────────────────────────────────────────────────
// Seed routines
// ─────────────────────────────────────────────────────────

async function seedUsers() {
  const hashed = await bcrypt.hash(TEST_PASSWORD, 10);

  const fixtures = [
    {
      id: TEST_IDS.users.admin,
      email: "admin.test@example.com",
      role: "ADMIN" as const,
      firstName: "Admin",
      lastName: "Test",
    },
    {
      id: TEST_IDS.users.student,
      email: "student.test@example.com",
      role: "STUDENT" as const,
      firstName: "Student",
      lastName: "Test",
    },
    {
      id: TEST_IDS.users.instructor,
      email: "instructor.test@example.com",
      role: "INSTRUCTOR" as const,
      firstName: "Instructor",
      lastName: "Test",
    },
  ];

  for (const f of fixtures) {
    await prisma.user.upsert({
      where: { id: f.id },
      update: {
        email: f.email,
        firstName: f.firstName,
        lastName: f.lastName,
        role: f.role,
        isActive: true,
      },
      create: {
        id: f.id,
        email: f.email,
        password: hashed,
        firstName: f.firstName,
        lastName: f.lastName,
        role: f.role,
        isActive: true,
      },
    });
  }

  console.log(`  ✓ Seeded ${fixtures.length} test users (password = "${TEST_PASSWORD}")`);
}

async function seedIeltsExam() {
  await prisma.ieltsIntensiveExam.upsert({
    where: { id: TEST_IDS.exams.sampleListening },
    update: {},
    create: {
      id: TEST_IDS.exams.sampleListening,
      title: "Sample IELTS Listening Test",
      description: "Single-part listening exam for test fixtures.",
      duration: 30,
      type: "LISTENING",
      difficulty: "INTERMEDIATE",
      isPublished: true,
      questions: {
        parts: [
          {
            part: 1,
            audioUrl: "https://example.test/audio/part1.mp3",
            questions: [
              {
                id: "q1",
                type: "FILL_BLANK",
                question: "The speaker's name is ___.",
                answer: "John",
              },
              {
                id: "q2",
                type: "MULTIPLE_CHOICE",
                question: "What is the speaker's job?",
                options: ["Teacher", "Engineer", "Doctor"],
                answer: "Engineer",
              },
            ],
          },
        ],
      },
    },
  });
  console.log("  ✓ Seeded 1 IELTS Intensive exam (LISTENING, INTERMEDIATE)");
}

async function seedFoundationVocab() {
  await prisma.foundationVocabBook.upsert({
    where: { id: TEST_IDS.vocab.book },
    update: { name: "Test Vocab Book", wordCount: 1 },
    create: {
      id: TEST_IDS.vocab.book,
      name: "Test Vocab Book",
      imageUrl: "https://example.test/book.png",
      wordCount: 1,
      order: 0,
    },
  });

  await prisma.foundationVocabUnit.upsert({
    where: { id: TEST_IDS.vocab.unit },
    update: {},
    create: {
      id: TEST_IDS.vocab.unit,
      bookId: TEST_IDS.vocab.book,
      title: "Unit 1: Greetings",
      order: 1,
    },
  });

  await prisma.foundationVocabItem.upsert({
    where: { id: TEST_IDS.vocab.item },
    update: {},
    create: {
      id: TEST_IDS.vocab.item,
      unitId: TEST_IDS.vocab.unit,
      word: "hello",
      meaning: "xin chào",
      ipa: "/həˈloʊ/",
      partOfSpeech: "interjection",
      order: 0,
    },
  });
  console.log("  ✓ Seeded 1 Foundation Vocab Book → Unit → Item");
}

async function seedAchievement() {
  await prisma.achievement.upsert({
    where: { key: "TEST_FIRST_LOGIN" },
    update: {},
    create: {
      id: TEST_IDS.achievements.firstLogin,
      key: "TEST_FIRST_LOGIN",
      name: "First Login (test)",
      description: "Granted on first login — used by integration tests.",
      icon: "🎉",
      category: "ONBOARDING",
      tier: 1,
      xpReward: 10,
      order: 0,
    },
  });
  console.log("  ✓ Seeded 1 Achievement (key=TEST_FIRST_LOGIN)");
}

async function seedPricingPlan() {
  await prisma.pricingPlan.upsert({
    where: { id: TEST_IDS.plans.premiumMonthly },
    update: { isActive: true },
    create: {
      id: TEST_IDS.plans.premiumMonthly,
      tier: "PREMIUM",
      name: "Premium Monthly (test)",
      description: "Test fixture plan — không dùng cho production.",
      priceAmount: 999,
      currency: "USD",
      interval: "month",
      intervalCount: 1,
      isActive: true,
      order: 1,
      features: [
        "Unlimited grading (mock)",
        "Test fixture only",
      ],
    },
  });
  console.log("  ✓ Seeded 1 PricingPlan (PREMIUM monthly)");
}

// ─────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (!dbUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  // Cảnh báo an toàn: chỉ chấp nhận chạy nếu connection string KHÔNG
  // trỏ về production. Heuristic: schema=test hoặc localhost.
  const isSafe =
    /schema=test\b/.test(dbUrl) ||
    /localhost|127\.0\.0\.1/.test(dbUrl) ||
    process.env.SEED_TEST_FORCE === "1";

  if (!isSafe) {
    console.error(
      "❌ Refusing to run seed-test against this DATABASE_URL.\n" +
        "   Expected `?schema=test` in URL or localhost host.\n" +
        "   Set SEED_TEST_FORCE=1 to override (NOT recommended).",
    );
    process.exit(1);
  }

  console.log("🌱 Seeding test fixtures…");
  await seedUsers();
  await seedIeltsExam();
  await seedFoundationVocab();
  await seedAchievement();
  await seedPricingPlan();
  console.log("✅ Seed-test completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seed-test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
