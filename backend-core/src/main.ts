import './telemetry';
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { PrismaService } from "./common/prisma/prisma.service";
import { json, urlencoded } from "express";

async function bootstrap() {
  // ── Global crash guards ──
  // Prevent the Node process from silently dying on transient errors
  // (e.g. DB timeouts, Redis drops, Cloudinary failures, etc.)
  process.on("unhandledRejection", (reason, promise) => {
    console.error("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
  });
  process.on("uncaughtException", (error) => {
    console.error("⚠️ Uncaught Exception:", error);
    // Only exit on truly fatal errors (e.g. out of memory)
    if (error.message?.includes("ENOMEM")) {
      process.exit(1);
    }
  });

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

  // ── Permanent Backend Keep-Alive Timer ──
  // Keeps Prisma DB + Redis connections alive to prevent stale-connection errors
  // after idle periods. If a ping fails, actively reconnect.
  const KEEP_ALIVE_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes (below PostgreSQL's default idle timeout)
  setInterval(async () => {
    // Ping Database
    try {
      const prisma = app.get(PrismaService);
      if (prisma) {
        await prisma.$queryRaw`SELECT 1`;
      }
    } catch (err) {
      console.warn("⏱️ Keep-alive: DB ping failed, reconnecting...", err?.message);
      try {
        const prisma = app.get(PrismaService);
        await prisma.$connect();
        console.log("⏱️ Keep-alive: DB reconnected successfully");
      } catch (reconnectErr) {
        console.error("⏱️ Keep-alive: DB reconnect failed:", reconnectErr?.message);
      }
    }
  }, KEEP_ALIVE_INTERVAL_MS);
}

bootstrap();
