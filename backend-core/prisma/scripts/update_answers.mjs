import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.ieltsIntensiveSession.update({
    where: { id: '1e8bbaab-44a9-4839-a9e9-a44986820985' },
    data: {
      answers: {
        "0-0": "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        "0-1": "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        "0-2": "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        "0-3": "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        "1-0": "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        "2-0": "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        "2-1": "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
        "2-2": "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      }
    }
  });
  console.log("Updated answers");
}
run().finally(() => prisma.$disconnect());
