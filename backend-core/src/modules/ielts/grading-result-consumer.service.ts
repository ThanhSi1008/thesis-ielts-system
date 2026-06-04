import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";
import { PrismaService } from "../../common/prisma/prisma.service";

type GradingResultEvent = {
  jobId?: string;
  sessionId: string;
  userId?: string;
  examType?: string;
  type?: string;
  status: "GRADED" | "GRADING_FAILED";
  score?: number;
  feedback?: any;
  error?: string | null;
  gradedAt?: string;
};

@Injectable()
export class GradingResultConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GradingResultConsumerService.name);
  private connection: any;
  private channel: any;
  private queueName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.queueName = this.configService.get<string>(
      "RABBITMQ_QUEUE_GRADING_RESULT",
      "exam-grading-result-queue",
    );
  }

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>("RABBITMQ_URL");
    if (!rabbitmqUrl) {
      this.logger.warn("RABBITMQ_URL is not configured; grading result consumer disabled");
      return;
    }

    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue("exam-grading-result-dlq", { durable: true });
      await this.channel.assertQueue(this.queueName, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "",
          "x-dead-letter-routing-key": "exam-grading-result-dlq",
        },
      });
      await this.channel.prefetch(1);
      await this.channel.consume(this.queueName, (message) => this.handleMessage(message), {
        noAck: false,
      });
      this.logger.log(`Listening for grading results on ${this.queueName}`);
    } catch (error) {
      this.logger.error("Failed to start grading result consumer", error);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async handleMessage(message: amqp.ConsumeMessage | null) {
    if (!message) return;

    try {
      const event = JSON.parse(message.content.toString()) as GradingResultEvent;
      await this.applyResult(event);
      this.channel.ack(message);
    } catch (error) {
      this.logger.error("Failed to apply grading result event", error);
      this.channel.nack(message, false, false);
    }
  }

  private async applyResult(event: GradingResultEvent) {
    if (!event.sessionId) {
      throw new Error("Missing sessionId in grading result event");
    }

    const examType = event.examType || event.type;
    if (event.status === "GRADING_FAILED") {
      await this.markFailed(examType, event.sessionId, event.error);
      return;
    }

    if (typeof event.score !== "number") {
      throw new Error(`Missing score for graded session ${event.sessionId}`);
    }

    if (examType === "WRITING" || examType === "SPEAKING") {
      await this.applyIntensiveResult(event, examType);
      return;
    }

    if (examType === "ADVANCED_WRITING") {
      await this.prisma.ieltsAdvancedWritingSession.update({
        where: { id: event.sessionId },
        data: {
          status: "GRADED",
          feedback: event.feedback,
          bandScore: event.score,
        },
      });
      return;
    }

    if (examType === "ADVANCED_SPEAKING") {
      await this.prisma.ieltsAdvancedSpeakingSession.update({
        where: { id: event.sessionId },
        data: {
          status: "GRADED",
          feedback: event.feedback,
          bandScore: event.score,
        },
      });
      return;
    }

    throw new Error(`Unsupported grading result type: ${examType}`);
  }

  private async applyIntensiveResult(event: GradingResultEvent, examType: string) {
    const userId = event.userId || (await this.findIntensiveSessionUserId(event.sessionId));
    const score = event.score || 0;
    const gradedAt = event.gradedAt ? new Date(event.gradedAt) : new Date();

    await this.prisma.$transaction([
      this.prisma.ieltsIntensiveResult.upsert({
        where: { sessionId: event.sessionId },
        update: {
          totalScore: score,
          writingScore: examType === "WRITING" ? score : null,
          speakingScore: examType === "SPEAKING" ? score : null,
          feedback: event.feedback,
          gradedAt,
        },
        create: {
          userId,
          sessionId: event.sessionId,
          totalScore: score,
          writingScore: examType === "WRITING" ? score : null,
          speakingScore: examType === "SPEAKING" ? score : null,
          feedback: event.feedback,
          gradedAt,
        },
      }),
      this.prisma.ieltsIntensiveSession.update({
        where: { id: event.sessionId },
        data: { status: "GRADED" },
      }),
    ]);
  }

  private async markFailed(examType: string | undefined, sessionId: string, error?: string | null) {
    const feedback = error ? { error } : undefined;

    if (examType === "ADVANCED_WRITING") {
      await this.prisma.ieltsAdvancedWritingSession.update({
        where: { id: sessionId },
        data: { status: "GRADING_FAILED", feedback },
      });
      return;
    }

    if (examType === "ADVANCED_SPEAKING") {
      await this.prisma.ieltsAdvancedSpeakingSession.update({
        where: { id: sessionId },
        data: { status: "GRADING_FAILED", feedback },
      });
      return;
    }

    await this.prisma.ieltsIntensiveSession.update({
      where: { id: sessionId },
      data: { status: "GRADING_FAILED" },
    });
  }

  private async findIntensiveSessionUserId(sessionId: string) {
    const session = await this.prisma.ieltsIntensiveSession.findUnique({
      where: { id: sessionId },
      select: { userId: true },
    });

    if (!session) {
      throw new Error(`Intensive session not found: ${sessionId}`);
    }

    return session.userId;
  }
}
