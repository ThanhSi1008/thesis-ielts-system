import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const ids = ["1", "2", "3", "4", "5", "6", "7"];
    
    for (const id of ids) {
        try {
            await prisma.shadowingVideo.delete({ where: { id } });
            console.log(`Deleted ShadowingVideo ${id}`);
        } catch (e) {}

        try {
            await prisma.dictationVideo.delete({ where: { id: `dictation-${id}` } });
            console.log(`Deleted DictationVideo dictation-${id}`);
        } catch (e) {}
    }
}

main().then(() => prisma.$disconnect());
