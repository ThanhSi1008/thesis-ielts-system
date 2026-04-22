import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

// Define a type for user data without password
export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SafeUser[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return users;
  }

  async findOne(id: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        isActive: updateUserDto.isActive,
        role: updateUserDto.role as any,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return user;
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: 'User deleted successfully' };
  }

  // --- Student-Teacher Linking ---

  async linkTeacher(studentId: string, teacherId: string) {
    // Verify teacher exists and is an instructor/teacher
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new Error('Teacher ID does not exist in the system');
    }

    if (studentId === teacherId) {
      throw new Error('Students cannot link to themselves');
    }

    return this.prisma.studentTeacherLink.upsert({
      where: {
        studentId_teacherId: {
          studentId,
          teacherId,
        },
      },
      update: {
        status: 'LINKED', // In case they were previously unlinked/pending
      },
      create: {
        studentId,
        teacherId,
        status: 'LINKED',
      },
    });
  }

  async getLinkedTeachers(studentId: string) {
    const links = await this.prisma.studentTeacherLink.findMany({
      where: { studentId, status: 'LINKED' },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });
    return links;
  }

  async getLinkedStudents(teacherId: string) {
    const links = await this.prisma.studentTeacherLink.findMany({
      where: { teacherId, status: 'LINKED' },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });
    return links;
  }

  async unlinkTeacher(studentId: string, teacherId: string) {
    return this.prisma.studentTeacherLink.delete({
      where: {
        studentId_teacherId: {
          studentId,
          teacherId,
        },
      },
    });
  }

  async getStudentStats(teacherId: string, studentId: string) {
    // 1. Verify link
    const link = await this.prisma.studentTeacherLink.findUnique({
      where: { studentId_teacherId: { studentId, teacherId } },
    });

    if (!link || link.status !== 'LINKED') {
      throw new Error('Not linked to this student');
    }

    // 2. Fetch mock test history (exam sessions with type FULL_TEST or similar IELTS parts)
    const examSessions = await this.prisma.examSession.findMany({
      where: { userId: studentId },
      include: {
        exam: {
          select: { title: true, type: true },
        },
        result: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // 3. Fetch practice history
    const practiceSessions = await this.prisma.ieltsPracticeSession.findMany({
      where: { userId: studentId },
      include: {
        part: {
          select: { title: true, partNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      examSessions,
      practiceSessions,
    };
  }
}
