import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Login to get a token
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
    const token = loginRes.data.accessToken;

    // 2. Create the video
    const videoPayload = {
      title: "Test API Strip",
      youtubeVideoId: "abcd",
      duration: "1:00",
      sentences: [
        { id: 1, english: "hello", words: ["hello"] }
      ]
    };
    
    const createRes = await axios.post('http://localhost:3000/api/v1/shadowing/videos', videoPayload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Created video:', createRes.data.id);

    // 3. Verify in DB
    const dbVideo = await prisma.shadowingVideo.findUnique({
      where: { id: createRes.data.id }
    });

    console.log('DB sentences:', JSON.stringify(dbVideo?.sentences, null, 2));

  } catch (err: any) {
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error(err);
    }
  } finally {
    await prisma.$disconnect();
  }
}
main();
