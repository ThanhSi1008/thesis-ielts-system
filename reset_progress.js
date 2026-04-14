const { PrismaClient } = require('./node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  // Delete all progress records so user can start fresh with fixed locking
  const deleted = await p.ieltsBasicProgress.deleteMany({});
  console.log(`Deleted ${deleted.count} progress record(s). Starting fresh.`);
}

main().finally(() => p.$disconnect());
