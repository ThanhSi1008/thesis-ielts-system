import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../../common/prisma/prisma.service";

@Injectable()
export class DictationFoldersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    const folders = await this.prisma.dictationFolder.findMany({
      where: { userId },
      orderBy: { order: "asc" },
    });
    return folders.map((f) => f.name);
  }

  async create(userId: string, name: string) {
    const existing = await this.prisma.dictationFolder.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (existing) return existing;

    const count = await this.prisma.dictationFolder.count({ where: { userId } });
    return this.prisma.dictationFolder.create({
      data: { userId, name, order: count },
    });
  }

  async rename(userId: string, oldName: string, newName: string) {
    const folder = await this.prisma.dictationFolder.findUnique({
      where: { userId_name: { userId, name: oldName } },
    });
    if (!folder) throw new NotFoundException("Folder not found");

    await this.prisma.dictationVideo.updateMany({
      where: { userId, folder: oldName },
      data: { folder: newName },
    });

    return this.prisma.dictationFolder.update({
      where: { userId_name: { userId, name: oldName } },
      data: { name: newName },
    });
  }

  async delete(userId: string, name: string) {
    const folder = await this.prisma.dictationFolder.findUnique({
      where: { userId_name: { userId, name } },
    });
    if (!folder) throw new NotFoundException("Folder not found");

    await this.prisma.dictationVideo.updateMany({
      where: { userId, folder: name },
      data: { folder: "All Videos" },
    });

    return this.prisma.dictationFolder.delete({
      where: { userId_name: { userId, name } },
    });
  }
}

