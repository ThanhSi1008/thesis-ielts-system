const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.ieltsAdvancedWritingPrompt.findUnique({where: {id: '384b4782-b70b-4150-9801-1502dca7eccd'}}).then(console.log).finally(() => prisma.$disconnect());
