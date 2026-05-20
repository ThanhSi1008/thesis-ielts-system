import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PostsService } from "./posts.service";
import { StorageService } from "../../common/storage/storage.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreatePostDto, ListPostsDto, CreateCommentDto } from "./dto/posts.dto";

@Controller("posts")
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly storageService: StorageService,
  ) {}

  // ==================== POST CRUD ====================

  @Post()
  async createPost(@Request() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.createPost(req.user.id, dto);
  }

  @Get()
  async listPosts(@Request() req: any, @Query() query: ListPostsDto) {
    return this.postsService.listPosts(req.user.id, query);
  }

  @Get(":id")
  async getPost(@Request() req: any, @Param("id") id: string) {
    return this.postsService.getPost(req.user.id, id);
  }

  @Delete(":id")
  async deletePost(@Request() req: any, @Param("id") id: string) {
    return this.postsService.deletePost(req.user, id);
  }

  // ==================== INTERACTIONS ====================

  @Post(":id/like")
  async toggleLike(@Request() req: any, @Param("id") id: string) {
    return this.postsService.toggleLike(req.user.id, id);
  }

  @Post(":id/bookmark")
  async toggleBookmark(@Request() req: any, @Param("id") id: string) {
    return this.postsService.toggleBookmark(req.user.id, id);
  }

  // ==================== COMMENTS ====================

  @Post(":id/comments")
  async createComment(
    @Request() req: any,
    @Param("id") id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.createComment(req.user.id, id, dto);
  }

  @Delete("comments/:commentId")
  async deleteComment(
    @Request() req: any,
    @Param("commentId") commentId: string,
  ) {
    return this.postsService.deleteComment(req.user.id, commentId);
  }

  // ==================== IMAGE UPLOAD ====================

  @Post("images/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("File is required");
    const url = await this.storageService.uploadFile(file, "post_images");
    return { url };
  }
}
