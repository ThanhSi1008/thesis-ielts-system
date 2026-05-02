import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";

@Injectable()
export class DictationLessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.dictationVideo.findMany({
      where: { userId: null },
      orderBy: { id: "asc" },
    });
  }

  async findById(id: string) {
    const lesson = await this.prisma.dictationVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("Dictation lesson not found");
    return lesson;
  }
}
