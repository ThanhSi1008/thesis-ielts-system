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
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // --- Self-service profile routes (must be ABOVE :id) ---

  @Get("me")
  getMe(@Req() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch("me")
  updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }

  @Delete("me")
  deleteMe(@Req() req: any) {
    return this.usersService.remove(req.user.id);
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
