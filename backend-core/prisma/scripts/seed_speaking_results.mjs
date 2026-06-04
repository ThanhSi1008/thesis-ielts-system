import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { id: '61e1a283-318e-4d02-9b56-a80c8fa14069' } }) || await prisma.user.findFirst();
  
  const exam = await prisma.ieltsIntensiveExam.findFirst({ where: { type: 'SPEAKING' } });
  if (!exam) throw new Error("No speaking exam found");

  const answers = {
    "1-1": "http://localhost:9000/toeic-files/audio/example1.webm",
    "2-1": "http://localhost:9000/toeic-files/audio/example2.webm",
    "3-1": "http://localhost:9000/toeic-files/audio/example3.webm"
  };

  const feedback = {
    overall_band: 8.5,
    criteria: {
      fluency_and_coherence: {
        band: 8.5,
        strengths: ["Speaks fluently with only occasional repetition or self-correction", "Develops topics fully and appropriately"],
        weak_areas: ["Occasional hesitation for content"],
        how_to_improve: ["Practice speaking at length on unfamiliar topics to reduce content-related hesitation"],
        mistakes: []
      },
      lexical_resource: {
        band: 8.5,
        strengths: ["Uses a wide vocabulary resource readily and flexibly", "Uses less common and idiomatic vocabulary skillfully"],
        weak_areas: ["Occasional inaccuracies in word choice"],
        how_to_improve: ["Focus on precise collocations when using advanced vocabulary"],
        mistakes: [
          { original: "big improvement", correction: "significant improvement", explanation: "More precise and academic vocabulary" }
        ]
      },
      grammatical_range_and_accuracy: {
        band: 8.0,
        strengths: ["Produces a majority of error-free sentences", "Uses a wide range of complex structures"],
        weak_areas: ["Some basic errors persist when using highly complex structures"],
        how_to_improve: ["Review conditionals and complex relative clauses"],
        mistakes: []
      },
      pronunciation: {
        band: 9.0,
        strengths: ["Uses a full range of pronunciation features with precision and subtlety", "Is effortless to understand"],
        weak_areas: [],
        how_to_improve: [],
        mistakes: []
      }
    },
    transcripts: {
      "1-1": {
        question: "Let's talk about your hometown.",
        transcript: "Well, I grew up in a vibrant city in the south. It's renowned for its culinary scene and bustling street life, which makes it an incredibly dynamic place to live.",
        words: []
      },
      "2-1": {
        question: "Describe a memorable journey.",
        transcript: "One journey that really stands out in my memory is a backpacking trip I took across Southeast Asia. The most remarkable aspect was immersing myself in diverse cultures.",
        words: []
      },
      "3-1": {
        question: "How has transportation changed?",
        transcript: "Transportation has undergone a massive transformation. We've seen a shift from traditional fossil-fuel dependent vehicles to more sustainable options like electric cars and improved public transit networks.",
        words: []
      }
    }
  };

  const session = await prisma.ieltsIntensiveSession.create({
    data: {
      userId: user.id,
      examId: exam.id,
      status: 'GRADED',
      answers,
      timeTaken: 850,
      startedAt: new Date(Date.now() - 3600000),
      submittedAt: new Date(Date.now() - 1800000),
      ieltsIntensiveResult: {
        create: {
          userId: user.id,
          totalScore: 8.5,
          speakingScore: 8.5,
          feedback
        }
      }
    }
  });

  console.log('Created speaking session:', session.id, 'for exam:', exam.title, 'Exam ID:', exam.id, 'User:', user.email);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
