import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Running minimal seed...");
  const book = await prisma.foundationVocabBook.upsert({
    where: { id: "test-book-id" }, // Using a fixed ID for minimal seed
    update: {},
    create: {
      id: "test-book-id",
      name: "Test FoundationVocabWord Book",
      imageUrl: "https://via.placeholder.com/150",
      wordCount: 1,
    }
  });

  const unit = await prisma.foundationVocabUnit.create({
    data: {
      bookId: book.id,
      title: "Unit 1: Introduction",
      order: 1,
    }
  });

  await prisma.foundationVocabItem.create({
    data: {
      unitId: unit.id,
      word: "Hello",
      meaning: "Xin chào",
      ipa: "/həˈloʊ/",
    }
  });

  console.log("✅ Minimal seed completed!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
