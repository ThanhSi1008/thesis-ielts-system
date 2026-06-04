import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";
import { PronunciationService } from "./pronunciation.service";

type PronunciationResultEvent = {
  attemptId: string;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  transcribedText?: string;
  score?: number;
  feedback?: any;
  error?: string | null;
};

@Injectable()
export class PronunciationResultConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PronunciationResultConsumerService.name);
  private connection: any;
  private channel: any;
  private queueName = "pronunciation-check-result-queue";

  constructor(
    private readonly configService: ConfigService,
    private readonly pronunciationService: PronunciationService,
  ) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>("RABBITMQ_URL");
    if (!rabbitmqUrl) {
      this.logger.warn("RABBITMQ_URL is not configured; pronunciation result consumer disabled");
      return;
    }

    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue("pronunciation-check-result-dlq", { durable: true });
      await this.channel.assertQueue(this.queueName, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": "pronunciation-check-result-dlq",
        },
      });
      await this.channel.prefetch(1);
      await this.channel.consume(this.queueName, (message) => this.handleMessage(message), {
        noAck: false,
      });
      this.logger.log(`Listening for pronunciation results on ${this.queueName}`);
    } catch (error) {
      this.logger.error("Failed to start pronunciation result consumer", error);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async handleMessage(message: amqp.ConsumeMessage | null) {
    if (!message) return;

    try {
      const event = JSON.parse(message.content.toString()) as PronunciationResultEvent;
      await this.applyResult(event);
      this.channel.ack(message);
    } catch (error) {
      this.logger.error("Failed to apply pronunciation result event", error);
      this.channel.nack(message, false, false);
    }
  }

  private async applyResult(event: PronunciationResultEvent) {
    if (!event.attemptId) {
      throw new Error("Missing attemptId in pronunciation result event");
    }

    await this.pronunciationService.updatePronunciationAttempt(event.attemptId, {
      transcribedText: event.transcribedText,
      score: event.score,
      feedback: event.feedback || (event.error ? { error: event.error } : undefined),
      status: event.status,
    });
  }
}
