import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";

@Injectable()
export class AiClientService implements OnModuleInit, OnModuleDestroy {
  private connection: any; // amqp.Connection causes type conflicts
  private channel: any; // amqp.Channel
  private queueName: string;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const rabbitmqUrl = this.configService.get<string>("RABBITMQ_URL");
    this.queueName = this.configService.get<string>(
      "RABBITMQ_QUEUE_GRADING",
      "exam-grading-queue",
    );

    try {
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName, { 
        durable: true,
        arguments: {
          'x-message-ttl': 300000,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': 'exam-grading-dlq'
        }
      });
      console.log("✅ RabbitMQ connected successfully");
    } catch (error) {
      console.error("❌ RabbitMQ connection error:", error);
    }
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
    console.log("❌ RabbitMQ disconnected");
  }

  async publishGradingTask(task: any): Promise<void> {
    const message = JSON.stringify(task);
    this.channel.sendToQueue(this.queueName, Buffer.from(message), {
      persistent: true,
    });
    console.log(`📤 Published grading task for session: ${task.sessionId}`);
  }
}
