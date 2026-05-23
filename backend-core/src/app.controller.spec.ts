import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let controller: AppController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      getHealth: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: serviceMock }],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe("getRoot", () => {
    it("should return root metadata", () => {
      const result = controller.getRoot();
      expect(result).toEqual({
        message: "IELTS Master AI - Core Backend API",
        version: "1.0.0",
        status: "running",
      });
    });
  });

  describe("getHealth", () => {
    it("should call appService.getHealth", () => {
      const mockHealth = { status: "healthy" };
      serviceMock.getHealth.mockReturnValue(mockHealth);

      const result = controller.getHealth();

      expect(serviceMock.getHealth).toHaveBeenCalled();
      expect(result).toEqual(mockHealth);
    });
  });
});
