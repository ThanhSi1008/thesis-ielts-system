import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

describe("PrismaService", () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it("should call $connect on onModuleInit", async () => {
    const connectSpy = jest
      .spyOn(service, "$connect")
      .mockResolvedValue(undefined);
    const logSpy = jest
      .spyOn(Logger.prototype, "log")
      .mockImplementation(() => {});

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("✅ Database connected successfully");

    connectSpy.mockRestore();
    logSpy.mockRestore();
  });

  it("should call $disconnect on onModuleDestroy", async () => {
    const disconnectSpy = jest
      .spyOn(service, "$disconnect")
      .mockResolvedValue(undefined);
    const logSpy = jest
      .spyOn(Logger.prototype, "log")
      .mockImplementation(() => {});

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("❌ Database disconnected");

    disconnectSpy.mockRestore();
    logSpy.mockRestore();
  });
});
