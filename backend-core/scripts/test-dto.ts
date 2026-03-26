import { ValidationPipe } from '@nestjs/common';
import { CreateVideoDto } from './src/modules/shadowing/dto/create-video.dto';

async function main() {
  const payload = {
    title: "Test",
    youtubeVideoId: "123",
    duration: "1:00",
    sentences: [
      { id: 1, english: "hello", words: ["hello"] },
      { id: 2, english: "world", words: ["world"] }
    ]
  };

  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  });

  try {
    const result = await validationPipe.transform(payload, { type: 'body', metatype: CreateVideoDto });
    console.log('Result from pipe:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Validation failed:', err);
  }
}
main();
