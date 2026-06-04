import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";
import { DictationVideosService } from "./dictation-videos.service";
import { ShadowingVideosService } from "./shadowing-videos.service";

type TranscriptionResultEvent = {
  jobId?: string;
  videoId: string;
  type?: "dictation" | "shadowing";
  status: "COMPLETED" | "FAILED";
  sentences?: any[];
  duration?: string;
  error?: string | null;
};

@Injectable()
export class TranscriptionResultConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TranscriptionResultConsumerService.name);
  private connection: any;
  private channel: any;
  private queueName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly dictationVideosService: DictationVideosService,
    private readonly shadowingVideosService: ShadowingVideosService,
  ) {
    this.queueName = this.configService.get<string>(
      "RABBITMQ_QUEUE_TRANSCRIPTION_RESULT",
      "dictation-transcription-result-queue",
    );
  }

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>("RABBITMQ_URL");
    if (!rabbitmqUrl) {
      this.logger.warn("RABBITMQ_URL is not configured; transcription result consumer disabled");
      return;
    }

    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue("dictation-transcription-result-dlq", { durable: true });
      await this.channel.assertQueue(this.queueName, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": "dictation-transcription-result-dlq",
        },
      });
      await this.channel.prefetch(1);
      await this.channel.consume(this.queueName, (message) => this.handleMessage(message), {
        noAck: false,
      });
      this.logger.log(`Listening for transcription results on ${this.queueName}`);
    } catch (error) {
      this.logger.error("Failed to start transcription result consumer", error);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async handleMessage(message: amqp.ConsumeMessage | null) {
    if (!message) return;

    try {
      const event = JSON.parse(message.content.toString()) as TranscriptionResultEvent;
      await this.applyResult(event);
      this.channel.ack(message);
    } catch (error) {
      this.logger.error("Failed to apply transcription result event", error);
      this.channel.nack(message, false, false);
    }
  }

  private async applyResult(event: TranscriptionResultEvent) {
    if (!event.videoId) {
      throw new Error("Missing videoId in transcription result event");
    }

    if (event.status === "FAILED") {
      await this.markFailed(event);
      return;
    }

    const dto = {
      sentences: event.sentences || [],
      duration: event.duration || "0:00",
    };

    if (event.type === "shadowing") {
      await this.shadowingVideosService.completeTranscription(event.videoId, dto);
      return;
    }

    await this.dictationVideosService.completeTranscription(event.videoId, dto);
  }

  private async markFailed(event: TranscriptionResultEvent) {
    if (event.type === "shadowing") {
      await this.shadowingVideosService.markTranscriptionFailed(event.videoId, event.error);
      return;
    }

    await this.dictationVideosService.markTranscriptionFailed(event.videoId, event.error);
  }
}
