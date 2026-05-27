import { Controller, Post, Body, Res } from "@nestjs/common";
import { Response } from "express";
import * as http from "http";

@Controller("chat")
export class ChatController {
  @Post()
  async proxyChat(@Body() body: any, @Res({ passthrough: false }) res: Response) {
    const { stream = true } = body;

    const options = {
      hostname: process.env.BACKEND_AI_HOST || "backend-ai",
      port: Number(process.env.BACKEND_AI_PORT) || 8000,
      path: "/api/v1/chat",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (stream) {
      const req = http.request(options, (aiRes) => {
        // Set status and headers before flushing
        res.status(aiRes.statusCode);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        
        // Pipe the stream from Backend AI directly to the client
        aiRes.pipe(res);
      });

      req.on("error", (e) => {
        console.error(`[ChatProxy] Problem with request: ${e.message}`);
        res.status(500).send("Error connecting to AI service");
      });

      // Write data to request body
      req.write(JSON.stringify(body));
      req.end();
    } else {
      const req = http.request(options, (aiRes) => {
        let data = "";
        aiRes.on("data", (chunk) => {
          data += chunk;
        });
        
        aiRes.on("end", () => {
          res.status(aiRes.statusCode);
          res.setHeader("Content-Type", "application/json");
          res.send(data);
        });
      });

      req.on("error", (e) => {
        console.error(`[ChatProxy] Problem with request: ${e.message}`);
        res.status(500).send("Error connecting to AI service");
      });

      // Write data to request body
      req.write(JSON.stringify(body));
      req.end();
    }
  }
}
