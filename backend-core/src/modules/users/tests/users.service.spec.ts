import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersService, SafeUser } from '../users.service';
import { PrismaService } from '../../../common/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: any;

  const TEST_USER: SafeUser = {
    id: 'user-001',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'STUDENT',
    isActive: true,
    createdAt: new Date(),
    avatar: null,
  };

  const TEST_TEACHER = {
    id: 'teacher-001',
    email: 'teacher@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'TEACHER',
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      studentTeacherLink: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      ieltsProfile: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      ieltsIntensiveSession: {
        findMany: jest.fn(),
      },
      ieltsAdvancedListeningSession: {
        findMany: jest.fn(),
      },
      ieltsAdvancedReadingSession: {
        findMany: jest.fn(),
      },
      ieltsAdvancedWritingSession: {
        findMany: jest.fn(),
      },
      ieltsAdvancedSpeakingSession: {
        findMany: jest.fn(),
      },
      foundationVocabProgress: {
        findMany: jest.fn(),
      },
      foundationGrammarProgress: {
        findMany: jest.fn(),
      },
      shadowingProgress: {
        findMany: jest.fn(),
      },
      dictationProgress: {
        findMany: jest.fn(),
      },
      shadowingVideo: {
        findMany: jest.fn(),
      },
      dictationVideo: {
        findMany: jest.fn(),
      },
      pushToken: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic CRUD Operations', () => {
    it('findAll — returns list of safe users', async () => {
      prismaMock.user.findMany.mockResolvedValue([TEST_USER]);
      const res = await service.findAll();
      expect(res).toEqual([TEST_USER]);
      expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('findOne — returns user when found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(TEST_USER);
      const res = await service.findOne('user-001');
      expect(res).toEqual(TEST_USER);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-001' },
        select: expect.any(Object),
      });
    });

    it('findOne — returns null when not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      const res = await service.findOne('non-existent');
      expect(res).toBeNull();
    });

    it('update — successfully updates and returns user', async () => {
      const updateDto = { firstName: 'Johnny', email: 'johnny@example.com' };
      const updatedUser = { ...TEST_USER, ...updateDto };
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const res = await service.update('user-001', updateDto);
      expect(res).toEqual(updatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-001' },
        data: expect.objectContaining({ firstName: 'Johnny' }),
        select: expect.any(Object),
      });
    });

    it('update — throws BadRequestException on P2002 duplicate key constraint', async () => {
      prismaMock.user.update.mockRejectedValue({ code: 'P2002' });
      await expect(service.update('user-001', { email: 'taken@example.com' }))
        .rejects.toThrow(BadRequestException);
    });

    it('update — rethrows other errors', async () => {
      prismaMock.user.update.mockRejectedValue(new Error('Database crash'));
      await expect(service.update('user-001', { email: 'taken@example.com' }))
        .rejects.toThrow('Database crash');
    });

    it('remove — deletes the user and returns success message', async () => {
      prismaMock.user.delete.mockResolvedValue(TEST_USER);
      const res = await service.remove('user-001');
      expect(res).toEqual({ message: 'User deleted successfully' });
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-001' },
      });
    });
  });

  describe('Student-Teacher Linking', () => {
    it('linkTeacher — throws error if teacher does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(service.linkTeacher('student-001', 'teacher-001'))
        .rejects.toThrow('Teacher ID does not exist in the system');
    });

    it('linkTeacher — throws error if student attempts to link to themselves', async () => {
      prismaMock.user.findUnique.mockResolvedValue(TEST_USER);
      await expect(service.linkTeacher('user-001', 'user-001'))
        .rejects.toThrow('Students cannot link to themselves');
    });

    it('linkTeacher — upserts link successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValue(TEST_TEACHER);
      prismaMock.studentTeacherLink.upsert.mockResolvedValue({ id: 'link-001', status: 'LINKED' });

      const res = await service.linkTeacher('student-001', 'teacher-001');
      expect(res).toEqual({ id: 'link-001', status: 'LINKED' });
      expect(prismaMock.studentTeacherLink.upsert).toHaveBeenCalledWith({
        where: {
          studentId_teacherId: { studentId: 'student-001', teacherId: 'teacher-001' },
        },
        update: { status: 'LINKED' },
        create: { studentId: 'student-001', teacherId: 'teacher-001', status: 'LINKED' },
      });
    });

    it('getLinkedTeachers — returns all active links for student', async () => {
      const links = [{ id: 'link-001', teacher: TEST_TEACHER }];
      prismaMock.studentTeacherLink.findMany.mockResolvedValue(links);

      const res = await service.getLinkedTeachers('student-001');
      expect(res).toEqual(links);
      expect(prismaMock.studentTeacherLink.findMany).toHaveBeenCalledWith({
        where: { studentId: 'student-001', status: 'LINKED' },
        include: { teacher: expect.any(Object) },
      });
    });

    it('getLinkedStudents — returns all active links for teacher', async () => {
      const links = [{ id: 'link-001', student: TEST_USER }];
      prismaMock.studentTeacherLink.findMany.mockResolvedValue(links);

      const res = await service.getLinkedStudents('teacher-001');
      expect(res).toEqual(links);
      expect(prismaMock.studentTeacherLink.findMany).toHaveBeenCalledWith({
        where: { teacherId: 'teacher-001', status: 'LINKED' },
        include: { student: expect.any(Object) },
      });
    });

    it('unlinkTeacher — removes the student-teacher link', async () => {
      prismaMock.studentTeacherLink.delete.mockResolvedValue({ id: 'link-001' });

      const res = await service.unlinkTeacher('student-001', 'teacher-001');
      expect(res).toEqual({ id: 'link-001' });
      expect(prismaMock.studentTeacherLink.delete).toHaveBeenCalledWith({
        where: {
          studentId_teacherId: { studentId: 'student-001', teacherId: 'teacher-001' },
        },
      });
    });
  });

  describe('Student Statistics (getStudentStats)', () => {
    it('throws error if teacher and student are not linked', async () => {
      prismaMock.studentTeacherLink.findUnique.mockResolvedValue(null);
      await expect(service.getStudentStats('teacher-001', 'student-001'))
        .rejects.toThrow('Not linked to this student');
    });

    it('throws error if link is not active', async () => {
      prismaMock.studentTeacherLink.findUnique.mockResolvedValue({ status: 'PENDING' });
      await expect(service.getStudentStats('teacher-001', 'student-001'))
        .rejects.toThrow('Not linked to this student');
    });

    it('successfully queries and maps stats when linked', async () => {
      prismaMock.studentTeacherLink.findUnique.mockResolvedValue({ status: 'LINKED' });

      const mockProfile = {
        userId: 'student-001',
        currentStreak: 5,
        longestStreak: 12,
        user: TEST_USER,
      };
      prismaMock.ieltsProfile.findUnique.mockResolvedValue(mockProfile);

      const mockIntensiveSessions = [
        {
          id: 'session-001',
          examId: 'exam-001',
          status: 'COMPLETED',
          submittedAt: new Date('2026-06-01T12:00:00Z'),
          ieltsIntensiveExam: {
            title: 'Mock Reading Test 1',
            type: 'READING',
            difficulty: 'MEDIUM',
            duration: 60,
          },
          ieltsIntensiveResult: {
            totalScore: 32,
            writingScore: null,
            speakingScore: null,
          },
        },
      ];
      prismaMock.ieltsIntensiveSession.findMany.mockResolvedValue(mockIntensiveSessions);

      const mockListeningSessions = [
        {
          id: 'lis-001',
          partId: 'part-001',
          totalQuestions: 10,
          totalScore: 8,
          createdAt: new Date('2026-06-01T13:00:00Z'),
          part: { id: 'part-001', title: 'Listening Section 1' },
        },
      ];
      prismaMock.ieltsAdvancedListeningSession.findMany.mockResolvedValue(mockListeningSessions);

      const mockReadingSessions = [
        {
          id: 'read-001',
          partId: 'part-002',
          totalQuestions: 13,
          totalScore: 11,
          createdAt: new Date('2026-06-01T14:00:00Z'),
          part: { id: 'part-002', title: 'Reading Section 1' },
        },
      ];
      prismaMock.ieltsAdvancedReadingSession.findMany.mockResolvedValue(mockReadingSessions);

      const res = await service.getStudentStats('teacher-001', 'student-001');

      expect(res.profile).toEqual(mockProfile);
      expect(res.streak).toEqual({ currentStreak: 5, longestStreak: 12 });
      expect(res.mockHistory).toHaveLength(1);
      expect(res.mockHistory[0]).toEqual(expect.objectContaining({
        examTitle: 'Mock Reading Test 1',
        rawScore: 32,
      }));
      expect(res.advancedListeningHistory).toHaveLength(1);
      expect(res.advancedListeningHistory[0]).toEqual(expect.objectContaining({
        examTitle: 'Listening Section 1',
        rawScore: 8,
      }));
      expect(res.advancedReadingHistory).toHaveLength(1);
      expect(res.advancedReadingHistory[0]).toEqual(expect.objectContaining({
        examTitle: 'Reading Section 1',
        rawScore: 11,
      }));
    });
  });

  describe('Auxiliary & Push Token Methods', () => {
    it('updateAvatar — updates avatar url', async () => {
      const updatedUser = { ...TEST_USER, avatar: 'http://avatar.url' };
      prismaMock.user.update.mockResolvedValue(updatedUser);

      const res = await service.updateAvatar('user-001', 'http://avatar.url');
      expect(res).toEqual(updatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 'user-001' },
        data: { avatar: 'http://avatar.url' },
        select: expect.any(Object),
      });
    });

    it('addPushToken — upserts push token registration', async () => {
      const mockToken = { id: 'tok-001', token: 'expo-token', platform: 'ios' };
      prismaMock.pushToken.upsert.mockResolvedValue(mockToken);

      const res = await service.addPushToken('user-001', 'expo-token', 'ios');
      expect(res).toEqual(mockToken);
      expect(prismaMock.pushToken.upsert).toHaveBeenCalledWith({
        where: { token: 'expo-token' },
        update: expect.objectContaining({ userId: 'user-001' }),
        create: expect.objectContaining({ userId: 'user-001', token: 'expo-token', platform: 'ios' }),
      });
    });

    it('removePushToken — deletes token records', async () => {
      prismaMock.pushToken.deleteMany.mockResolvedValue({ count: 1 });

      const res = await service.removePushToken('user-001', 'expo-token');
      expect(res).toEqual({ count: 1 });
      expect(prismaMock.pushToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-001', token: 'expo-token' },
      });
    });
  });

  describe('Activity Tracking and Recommendations', () => {
    const today = new Date();

    const mockProfile = {
      userId: 'user-001',
      targetBand: 6.5,
      dailyCommitmentMins: 30,
      currentStreak: 3,
      longestStreak: 5,
    };

    beforeEach(() => {
      prismaMock.ieltsProfile.findUnique.mockResolvedValue(mockProfile);

      prismaMock.ieltsIntensiveSession.findMany.mockResolvedValue([
        {
          id: 'int-001',
          examId: 'ex-01',
          status: 'COMPLETED',
          timeTaken: 1200, // 20 mins
          createdAt: today,
          updatedAt: today,
          ieltsIntensiveExam: { title: 'Mock Exam 1', type: 'ACADEMIC', duration: 180 },
          ieltsIntensiveResult: { totalScore: 30 },
        },
      ]);
      prismaMock.ieltsAdvancedListeningSession.findMany.mockResolvedValue([
        {
          id: 'lis-001',
          partId: 'lp-01',
          totalScore: 5,
          totalQuestions: 10,
          createdAt: today,
          part: { title: 'Listening 1' },
        },
      ]);
      prismaMock.ieltsAdvancedReadingSession.findMany.mockResolvedValue([
        {
          id: 'read-001',
          partId: 'rp-01',
          totalScore: 6,
          totalQuestions: 10,
          createdAt: today,
          part: { title: 'Reading 1' },
        },
      ]);
      prismaMock.ieltsAdvancedWritingSession.findMany.mockResolvedValue([
        {
          id: 'write-001',
          promptId: 'wp-01',
          status: 'GRADED',
          bandScore: 7,
          timeTaken: 2400, // 40 mins
          createdAt: today,
          updatedAt: today,
          prompt: { title: 'Writing 1' },
        },
      ]);
      prismaMock.ieltsAdvancedSpeakingSession.findMany.mockResolvedValue([
        {
          id: 'speak-001',
          partId: 'sp-01',
          status: 'GRADED',
          bandScore: 6.5,
          timeTaken: 600, // 10 mins
          createdAt: today,
          updatedAt: today,
          part: { title: 'Speaking 1' },
        },
      ]);
      prismaMock.foundationVocabProgress.findMany.mockResolvedValue([
        {
          id: 'vocab-001',
          unitId: 'vu-01',
          wordsLearned: 5,
          totalWords: 10,
          questionScore: 90,
          createdAt: today,
          updatedAt: today,
          unit: { title: 'Vocab Unit 1', book: { name: 'Vocab Book' } },
        },
      ]);
      prismaMock.foundationGrammarProgress.findMany.mockResolvedValue([
        {
          id: 'grammar-001',
          unitId: 'gu-01',
          exerciseScore: 8,
          exerciseTotal: 10,
          theoryCompleted: true,
          createdAt: today,
          updatedAt: today,
          unit: { title: 'Grammar Unit 1', book: { name: 'Grammar Book' } },
        },
      ]);
      prismaMock.shadowingProgress.findMany.mockResolvedValue([
        {
          id: 'shad-001',
          lessonId: 'sv-01',
          completedSentences: ['s1', 's2'],
          createdAt: today,
          updatedAt: today,
        },
      ]);
      prismaMock.dictationProgress.findMany.mockResolvedValue([
        {
          id: 'dict-001',
          lessonId: 'dv-01',
          difficulty: 'NORMAL',
          completedSentences: ['s1', 's2', 's3'],
          createdAt: today,
          updatedAt: today,
        },
      ]);

      prismaMock.shadowingVideo.findMany.mockResolvedValue([
        { id: 'sv-01', title: 'Shadowing Vid 1', category: 'General', sentences: ['s1', 's2', 's3'] },
      ]);
      prismaMock.dictationVideo.findMany.mockResolvedValue([
        { id: 'dv-01', title: 'Dictation Vid 1', category: 'Academic', sentences: ['s1', 's2', 's3', 's4'] },
      ]);
    });

    it('getRecentActivity — creates profile if missing', async () => {
      prismaMock.ieltsProfile.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(mockProfile);
      prismaMock.ieltsProfile.create.mockResolvedValue(mockProfile);

      const res = await service.getRecentActivity('user-001');
      expect(prismaMock.ieltsProfile.create).toHaveBeenCalledWith({
        data: { userId: 'user-001', targetBand: 6.5, dailyCommitmentMins: 30 },
      });
      expect(res.streak.currentStreak).toBe(3);
    });

    it('getRecentActivity — handles race condition on profile creation', async () => {
      prismaMock.ieltsProfile.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(mockProfile);
      prismaMock.ieltsProfile.create.mockRejectedValue(new Error('Duplicate key'));

      const res = await service.getRecentActivity('user-001');
      expect(res.streak.currentStreak).toBe(3);
    });

    it('getRecentActivity — lists and calculates today study minutes correctly', async () => {
      const res = await service.getRecentActivity('user-001');

      expect(res.recentActivities).toHaveLength(9);
      // Mock: 20 mins, Listen: 15 mins (default), Read: 15 mins (default), Write: 40 mins, Speak: 10 mins,
      // Vocab: 10 mins (default), Grammar: 10 mins (default), Shadow: 5 mins (default), Dictation: 5 mins (default).
      // Total = 20 + 15 + 15 + 40 + 10 + 10 + 10 + 5 + 5 = 130 minutes.
      expect(res.streak.todayMins).toBe(130);
      expect(res.streak.progressPercent).toBe(100); // commitment is 30 mins
      expect(res.recommendations).toHaveLength(1); // Since all types were done, falls back to Mock Exam
      expect(res.recommendations[0].type).toBe('INTENSIVE');
    });

    it('getRecentActivity — provides smart recommendations when activities are missing', async () => {
      // Clear listening and vocab
      prismaMock.ieltsAdvancedListeningSession.findMany.mockResolvedValue([]);
      prismaMock.foundationVocabProgress.findMany.mockResolvedValue([]);

      const res = await service.getRecentActivity('user-001');

      // Should recommend speaking, listening, vocab, etc. based on what's missing
      // Speaking was done, vocab was not. So vocab should be in recommendations
      const recTypes = res.recommendations.map((r: any) => r.type);
      expect(recTypes).toContain('VOCABULARY');
    });

    it('getRecommended — returns the smart recommendations directly', async () => {
      const res = await service.getRecommended('user-001');
      expect(res).toBeDefined();
      expect(res.length).toBeGreaterThan(0);
    });
  });
});
