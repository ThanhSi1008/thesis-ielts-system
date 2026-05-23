import { Test, TestingModule } from "@nestjs/testing";
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
    const connectSpy = jest.spyOn(service, "$connect").mockResolvedValue(undefined);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await service.onModuleInit();

    expect(connectSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("✅ Database connected successfully");

    connectSpy.mockRestore();
    consoleSpy.mockRestore();
  });

  it("should call $disconnect on onModuleDestroy", async () => {
    const disconnectSpy = jest.spyOn(service, "$disconnect").mockResolvedValue(undefined);
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    await service.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith("❌ Database disconnected");

    disconnectSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
