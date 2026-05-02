import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";

@Injectable()
export class ShadowingLessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shadowingVideo.findMany({
      where: { userId: null },
      orderBy: { id: "asc" },
    });
  }

  async findById(id: string) {
    const lesson = await this.prisma.shadowingVideo.findFirst({
      where: { id, userId: null },
    });
    if (!lesson) throw new NotFoundException("Shadowing lesson not found");
    return lesson;
  }
}
