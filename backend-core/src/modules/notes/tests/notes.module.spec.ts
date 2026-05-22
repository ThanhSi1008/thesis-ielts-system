import { Test, TestingModule } from "@nestjs/testing";
import { NotesModule } from "../notes.module";
import { PrismaService } from "../../../common/prisma/prisma.service";

describe("NotesModule", () => {
  it("should compile and resolve NotesModule dependencies", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NotesModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(module).toBeDefined();
    expect(module.get(NotesModule)).toBeDefined();
  });
});
