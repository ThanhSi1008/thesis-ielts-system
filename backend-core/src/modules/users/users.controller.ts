import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Post,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { UpdateUserDto } from "./dto/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "../../common/storage/storage.service";

@Controller("users")
@UseGuards(JwtAuthGuard, ThrottlerGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // --- Self-service profile routes (must be ABOVE :id) ---

  @Get("me")
  getMe(@Req() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Get("me/recent-activity")
  getRecentActivity(@Req() req: any) {
    return this.usersService.getRecentActivity(req.user.id);
  }

  @Get("me/recommended")
  getRecommended(@Req() req: any) {
    return this.usersService.getRecommended(req.user.id);
  }

  @Patch("me")
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Delete("me")
  deleteMe(@Req() req: any) {
    return this.usersService.remove(req.user.id);
  }

  @Post("me/avatar")
  @UseInterceptors(FileInterceptor("file"))
  async uploadAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    const url = await this.storageService.uploadFile(file, "avatars");
    return this.usersService.updateAvatar(req.user.id, url);
  }

  @Delete("me/avatar")
  async deleteAvatar(@Req() req: any) {
    const user = await this.usersService.findOne(req.user.id);
    if (user && user.avatar) {
      try {
        await this.storageService.deleteFile(user.avatar);
      } catch (error) {
        // Silently ignore Cloudinary delete errors
      }
    }
    return this.usersService.updateAvatar(req.user.id, null);
  }

  @Post("me/push-token")
  async addPushToken(
    @Req() req: any,
    @Body("token") token: string,
    @Body("platform") platform: string,
  ) {
    if (!token || !platform) {
      throw new BadRequestException("Token and platform are required");
    }
    return this.usersService.addPushToken(req.user.id, token, platform);
  }

  @Delete("me/push-token")
  async removePushToken(@Req() req: any, @Body("token") token: string) {
    if (!token) {
      throw new BadRequestException("Token is required");
    }
    return this.usersService.removePushToken(req.user.id, token);
  }

  // --- Student-Teacher Linking ---

  @Post("link-teacher")
  linkTeacher(@Req() req: any, @Body("teacherId") teacherId: string) {
    return this.usersService.linkTeacher(req.user.id, teacherId);
  }

  @Get("my-teachers")
  getLinkedTeachers(@Req() req: any) {
    return this.usersService.getLinkedTeachers(req.user.id);
  }

  @Get("my-students")
  getLinkedStudents(@Req() req: any) {
    return this.usersService.getLinkedStudents(req.user.id);
  }

  @Delete("unlink-teacher/:id")
  unlinkTeacher(@Req() req: any, @Param("id") teacherId: string) {
    return this.usersService.unlinkTeacher(req.user.id, teacherId);
  }

  @Get("student/:id/stats")
  getStudentStats(@Req() req: any, @Param("id") studentId: string) {
    return this.usersService.getStudentStats(req.user.id, studentId);
  }

  // --- Dynamic CRUD Routes ---

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
