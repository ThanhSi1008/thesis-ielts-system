import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../redis/redis.service";
import * as amqp from "amqplib";

const CACHE_INVALIDATION_QUEUE = "cache_invalidation";
const CACHE_INVALIDATION_EXCHANGE = "cache_events";

export interface CacheInvalidationEvent {
  pattern: string; // Redis key pattern to invalidate (e.g., 'foundationVocabWord:*')
  source: string; // Source module that triggered the event
  timestamp: number;
}

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async onModuleInit() {
    try {
      const rabbitUrl =
        this.configService.get<string>("RABBITMQ_URL") ||
        "amqp://ielts:ielts_password@localhost:5672";
      this.connection = (await amqp.connect(rabbitUrl)) as any;
      this.channel = await (this.connection as any).createChannel();

      // Setup exchange and queue
      await this.channel.assertExchange(CACHE_INVALIDATION_EXCHANGE, "fanout", {
        durable: true,
      });
      await this.channel.assertQueue(CACHE_INVALIDATION_QUEUE, {
        durable: true,
      });
      await this.channel.bindQueue(
        CACHE_INVALIDATION_QUEUE,
        CACHE_INVALIDATION_EXCHANGE,
        "",
      );

      // Start consuming messages
      await this.channel.consume(CACHE_INVALIDATION_QUEUE, async (msg) => {
        if (msg) {
          try {
            const event: CacheInvalidationEvent = JSON.parse(
              msg.content.toString(),
            );
            await this.handleInvalidation(event);
            this.channel!.ack(msg);
          } catch (error) {
            this.logger.error(
              "Failed to process cache invalidation event",
              error,
            );
            this.channel!.nack(msg, false, false);
          }
        }
      });

      this.logger.log("✅ RabbitMQ cache invalidation listener started");
    } catch (error) {
      this.logger.error(
        "❌ Failed to connect to RabbitMQ for cache invalidation",
        error,
      );
    }
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await (this.connection as any).close();
  }

  // Publish a cache invalidation event
  async publishInvalidation(pattern: string, source: string) {
    if (!this.channel) {
      this.logger.warn("RabbitMQ channel not available, invalidating locally");
      await this.redisService.delByPattern(pattern);
      return;
    }

    const event: CacheInvalidationEvent = {
      pattern,
      source,
      timestamp: Date.now(),
    };

    this.channel.publish(
      CACHE_INVALIDATION_EXCHANGE,
      "",
      Buffer.from(JSON.stringify(event)),
      { persistent: true },
    );

    this.logger.debug(
      `Published cache invalidation: ${pattern} from ${source}`,
    );
  }

  // Handle incoming invalidation events
  private async handleInvalidation(event: CacheInvalidationEvent) {
    this.logger.log(
      `Invalidating cache: ${event.pattern} (from ${event.source})`,
    );
    const deleted = await this.redisService.delByPattern(event.pattern);
    this.logger.debug(`Deleted ${deleted} keys matching ${event.pattern}`);
  }
}
