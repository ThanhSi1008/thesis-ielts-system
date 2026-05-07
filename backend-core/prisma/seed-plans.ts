import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PLANS = [
  {
    tier: "PREMIUM" as const,
    name: "Premium Monthly",
    description: "Full access to all learning modules with AI grading",
    priceAmount: 999,  // $9.99
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    order: 1,
    features: [
      "All FoundationVocabWord & Grammar books",
      "Unlimited pronunciation practice",
      "All IELTS lessons & exercises",
      "IELTS Advanced Practice (Cambridge)",
      "10 AI Writing gradings/month",
      "10 AI Speaking gradings/month",
      "Unlimited Shadowing & Dictation",
      "Custom YouTube import",
      "Unlimited Vocab Lab decks & cards",
      "50 AI-generated cards/month",
      "Community Marketplace access",
      "Full ieltsIntensiveExam history",
      "Premium badge",
    ],
  },
  {
    tier: "PREMIUM" as const,
    name: "Premium Annual",
    description: "Full access — save 33% with annual billing",
    priceAmount: 7999, // $79.99
    currency: "USD",
    interval: "year",
    intervalCount: 1,
    order: 2,
    features: [
      "Everything in Premium Monthly",
      "Save 33% vs monthly billing",
    ],
  },
  {
    tier: "PRO" as const,
    name: "Pro Monthly",
    description: "Unlimited everything with priority AI processing",
    priceAmount: 1999, // $19.99
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    order: 3,
    features: [
      "Everything in Premium",
      "Unlimited AI Writing gradings",
      "Unlimited AI Speaking gradings",
      "Unlimited AI card generation",
      "Priority AI processing queue",
      "Progress reports (PDF export)",
      "Teacher dashboard access",
      "Pro badge",
      "Early access to new features",
    ],
  },
  {
    tier: "PRO" as const,
    name: "Pro Annual",
    description: "Unlimited everything — save 33% with annual billing",
    priceAmount: 15999, // $159.99
    currency: "USD",
    interval: "year",
    intervalCount: 1,
    order: 4,
    features: [
      "Everything in Pro Monthly",
      "Save 33% vs monthly billing",
    ],
  },
];

async function main() {
  console.log("Seeding pricing plans...");

  for (const plan of PLANS) {
    // Use name as the unique identifier for upsert (since no unique field in schema)
    const existing = await prisma.pricingPlan.findFirst({
      where: { name: plan.name },
    });

    if (existing) {
      await prisma.pricingPlan.update({
        where: { id: existing.id },
        data: plan,
      });
      console.log(`  Updated: ${plan.name}`);
    } else {
      await prisma.pricingPlan.create({ data: plan });
      console.log(`  Created: ${plan.name}`);
    }
  }

  console.log(`✅ Seeded ${PLANS.length} pricing plans`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
