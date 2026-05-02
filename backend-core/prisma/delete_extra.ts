import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function clean() {
    try {
        await prisma.shadowingVideo.delete({
            where: { id: "8" }
        });
        console.log("Deleted lesson 8 from ShadowingVideo");
    } catch (e) {
        console.log("Lesson 8 already deleted or not found in ShadowingVideo");
    }
}
clean().then(() => prisma.$disconnect());
