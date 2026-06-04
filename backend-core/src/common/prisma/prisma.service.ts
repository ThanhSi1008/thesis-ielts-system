import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log("✅ Database connected successfully");
        return;
      } catch (error) {
        this.logger.error(
          `❌ Database connection attempt ${attempt}/${maxRetries} failed: ${error.message}`,
        );
        if (attempt === maxRetries) {
          throw error; // Let NestJS handle the final failure
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("❌ Database disconnected");
  }
}
