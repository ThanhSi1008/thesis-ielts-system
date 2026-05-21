import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(): object {
    return {
      message: "IELTS Master AI - Core Backend API",
      version: "1.0.0",
      status: "running",
    };
  }

  @Get("health")
  getHealth(): object {
    return this.appService.getHealth();
  }
}
