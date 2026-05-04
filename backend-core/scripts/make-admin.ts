/**
 * Promote a user to ADMIN role.
 * Run with: npx ts-node scripts/make-admin.ts <email>
 *
 * Example:
 *   npx ts-node scripts/make-admin.ts admin@example.com
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("❌  Usage: npx ts-node scripts/make-admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌  No user found with email: ${email}`);
    process.exit(1);
  }

  if (user.role === "ADMIN") {
    console.log(`✅  ${email} is already ADMIN.`);
    return;
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
    select: { email: true, name: true, role: true },
  });

  console.log(`✅  Promoted to ADMIN:`, updated);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
