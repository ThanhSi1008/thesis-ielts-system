import { AppService } from "./app.service";

describe("AppService", () => {
  let service: AppService;
  let originalEnv: string | undefined;

  beforeAll(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  beforeEach(() => {
    service = new AppService();
  });

  it("should return the correct health status and fallback environment to development", () => {
    delete process.env.NODE_ENV;

    const result: any = service.getHealth();

    expect(result).toHaveProperty("status", "healthy");
    expect(result).toHaveProperty("timestamp");
    expect(result).toHaveProperty("uptime");
    expect(result).toHaveProperty("environment", "development");
  });

  it("should return the environment set in NODE_ENV", () => {
    process.env.NODE_ENV = "production";

    const result: any = service.getHealth();

    expect(result).toHaveProperty("environment", "production");
  });
});
