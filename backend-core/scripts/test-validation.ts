import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { CreateVideoDto } from './src/modules/shadowing/dto/create-video.dto';

async function test() {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  });

  const payload = {
    title: "Test Video",
    youtubeVideoId: "12345",
    folder: "Default",
    category: "Test",
    duration: "01:00",
    sentences: [
      {
        id: 1,
        english: "Hello world",
        phonetic: "",
        vietnamese: "",
        words: ["Hello", "world"],
        audioStart: 0.1,
        audioEnd: 1.0
      }
    ]
  };

  try {
    const result = await pipe.transform(payload, {
      type: 'body',
      metatype: CreateVideoDto,
    });
    console.log("TRANSFORMED RESULT:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("VALIDATION ERROR:", err.response?.message || err.message);
  }
}

test();
