import './telemetry';
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { json, urlencoded } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix for all routes
  const apiPrefix = configService.get<string>("API_PREFIX", "api/v1");
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS
  const corsOrigin = configService.get<string>("CORS_ORIGIN", "*");
  app.enableCors({
    origin: corsOrigin.split(","),
    credentials: true,
  });

  // Increase payload limit for base64 audio uploads
  app.use(json({ limit: "50mb" }));
  app.use(urlencoded({ extended: true, limit: "50mb" }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Start server
  const port = configService.get<number>("PORT", 3000);
  await app.listen(port);

  console.log(
    `🚀 Backend Core is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(
    `📚 Environment: ${configService.get<string>("NODE_ENV", "development")}`,
  );
}

bootstrap();
