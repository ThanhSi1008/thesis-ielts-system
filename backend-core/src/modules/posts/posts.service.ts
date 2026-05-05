import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CreatePostDto, ListPostsDto, CreateCommentDto } from "./dto/posts.dto";

// Reusable select object for author data (ISP: only fetch needed fields)
const AUTHOR_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  avatar: true,
  subscription: {
    select: { tier: true },
  },
} as const;

const POST_LIST_LIMIT = 20;
const COMMENT_LIST_LIMIT = 50;

import { GamificationService } from "../gamification/gamification.service";

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
  ) {}

  // ==================== POST CRUD ====================

  async createPost(userId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        authorId: userId,
        type: dto.type ?? "GENERAL",
        title: dto.title ?? null,
        body: dto.body,
        imageUrls: dto.imageUrls ?? [],
        tags: dto.tags ?? [],
        metadata: dto.metadata ?? null,
      },
      include: {
        author: { select: AUTHOR_SELECT },
      },
    });

    this.gamificationService
      .onEvent(userId, {
        xp: 5,
        reason: "COMMUNITY_POST",
        achievementKeys: ["CM_FIRST_POST"],
      })
      .catch(() => {});

    return post;
  }

  async listPosts(userId: string, query: ListPostsDto) {
    const limit = query.limit ?? POST_LIST_LIMIT;

    // Build the where clause
    const where: any = { isHidden: false };
    if (query.type) where.type = query.type;
    if (query.tag) where.tags = { has: query.tag };
    if (query.authorId) where.authorId = query.authorId;

    // Cursor-based pagination: fetch posts with createdAt < cursor post's createdAt
    let cursorCondition: any = undefined;
    if (query.cursor) {
      const cursorPost = await this.prisma.post.findUnique({
        where: { id: query.cursor },
        select: { createdAt: true },
      });
      if (cursorPost) {
        where.createdAt = { lt: cursorPost.createdAt };
      }
    }

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit + 1, // Fetch one extra to determine if there's a next page
      include: {
        author: { select: AUTHOR_SELECT },
        likes: {
          where: { userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    // Determine if there are more results
    const hasMore = posts.length > limit;
    const results = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    // Transform: add isLiked/isBookmarked booleans, remove raw arrays
    const items = results.map((post) => ({
      ...post,
      isLiked: post.likes.length > 0,
      isBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    }));

    return { items, nextCursor };
  }

  async getPost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: AUTHOR_SELECT },
        likes: {
          where: { userId },
          select: { id: true },
        },
        bookmarks: {
          where: { userId },
          select: { id: true },
        },
        comments: {
          where: { isHidden: false, parentId: null }, // Top-level only
          orderBy: { createdAt: "asc" },
          take: COMMENT_LIST_LIMIT,
          include: {
            author: { select: AUTHOR_SELECT },
            replies: {
              where: { isHidden: false },
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: AUTHOR_SELECT },
              },
            },
          },
        },
      },
    });

    if (!post || post.isHidden) {
      throw new NotFoundException("Post not found");
    }

    return {
      ...post,
      isLiked: post.likes.length > 0,
      isBookmarked: post.bookmarks.length > 0,
      likes: undefined,
      bookmarks: undefined,
    };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new NotFoundException("Post not found");
    if (post.authorId !== userId) throw new ForbiddenException("Not your post");

    await this.prisma.post.delete({ where: { id: postId } });
    return { success: true };
  }

  // ==================== LIKE ====================

  async toggleLike(userId: string, postId: string) {
    // Check post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw new NotFoundException("Post not found");

    // Check if already liked
    const existing = await this.prisma.postLike.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      // Unlike
      await this.prisma.$transaction([
        this.prisma.postLike.delete({ where: { id: existing.id } }),
        this.prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return { liked: false };
    }

    // Like — also fetch the author to check CM_CROWD_FAVORITE for them
    const [, updatedPost] = await this.prisma.$transaction([
      this.prisma.postLike.create({
        data: { postId, userId },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
        select: { authorId: true },
      }),
    ]);

    // Award achievement to the POST AUTHOR (not the liker)
    this.gamificationService
      .onEvent(updatedPost.authorId, {
        xp: 0,
        reason: "POST_LIKED",
        achievementKeys: ["CM_CROWD_FAVORITE"],
      })
      .catch(() => {});

    return { liked: true };
  }

  // ==================== BOOKMARK ====================

  async toggleBookmark(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw new NotFoundException("Post not found");

    const existing = await this.prisma.postBookmark.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.postBookmark.delete({ where: { id: existing.id } }),
        this.prisma.post.update({
          where: { id: postId },
          data: { bookmarkCount: { decrement: 1 } },
        }),
      ]);
      return { bookmarked: false };
    }

    await this.prisma.$transaction([
      this.prisma.postBookmark.create({
        data: { postId, userId },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { bookmarkCount: { increment: 1 } },
      }),
    ]);
    return { bookmarked: true };
  }

  // ==================== COMMENTS ====================

  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });
    if (!post) throw new NotFoundException("Post not found");

    // If replying to a comment, validate parent exists and belongs to same post
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { postId: true },
      });
      if (!parent || parent.postId !== postId) {
        throw new NotFoundException("Parent comment not found");
      }
    }

    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          postId,
          authorId: userId,
          body: dto.body,
          parentId: dto.parentId ?? null,
        },
        include: {
          author: { select: AUTHOR_SELECT },
        },
      }),
      this.prisma.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    this.gamificationService
      .onEvent(userId, {
        xp: 2,
        reason: "COMMUNITY_COMMENT",
        achievementKeys: ["CM_CONVERSATIONALIST"],
      })
      .catch(() => {});

    return comment;
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    });

    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.authorId !== userId) throw new ForbiddenException("Not your comment");

    await this.prisma.$transaction([
      this.prisma.comment.delete({ where: { id: commentId } }),
      this.prisma.post.update({
        where: { id: comment.postId },
        data: { commentCount: { decrement: 1 } },
      }),
    ]);

    return { success: true };
  }
}
