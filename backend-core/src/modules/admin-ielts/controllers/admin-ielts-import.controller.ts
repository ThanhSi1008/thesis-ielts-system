import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Headers,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "../../../common/storage/storage.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { Roles } from "../../../common/decorators/roles.decorator";
import { ContentImportService } from "../services/content-import.service";
import { IeltsContentCommitService } from "../services/ielts-content-commit.service";
import {
  CreateImportJobDto,
  SaveDraftDto,
  CallbackExtractedDto,
  CommitJobDto,
} from "../dto/admin-ielts.dto";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "crypto";

@Controller("admin/ielts/import")
export class AdminIeltsImportController {
  constructor(
    private readonly importService: ContentImportService,
    private readonly commitService: IeltsContentCommitService,
    private readonly configService: ConfigService,
    private readonly storageService: StorageService
  ) {}

  @Post("upload")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    const fileUrl = await this.storageService.uploadFile(file, "ielts_files");
    return { url: fileUrl };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  create(@Body() dto: CreateImportJobDto, @Request() req: any) {
    return this.importService.create(dto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  findAll() {
    return this.importService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  findOne(@Param("id") id: string) {
    return this.importService.findOne(id);
  }

  @Post(":id/extracted")
  extracted(
    @Param("id") id: string,
    @Headers("x-callback-signature") signature: string,
    @Req() req: any,
    @Body() body: CallbackExtractedDto
  ) {
    // Verify HMAC-SHA256 signature for secure webhook callback from backend-ai
    const secret = this.configService.get<string>("CALLBACK_SECRET");
    if (!secret) {
      if (this.configService.get("NODE_ENV") === "production") {
        throw new Error("CALLBACK_SECRET is required in production environment");
      }
    }
    const secretKey = secret || "test-callback-secret-value-for-ci";

    const raw: Buffer = req.rawBody ?? Buffer.from(JSON.stringify(body));
    const computed = createHmac("sha256", secretKey)
      .update(raw)
      .digest("hex");

    const ok =
      signature &&
      computed.length === signature.length &&
      timingSafeEqual(Buffer.from(computed), Buffer.from(signature));

    if (!ok) {
      throw new UnauthorizedException("Invalid callback signature");
    }

    return this.importService.saveExtractedContent(id, body);
  }

  @Patch(":id/draft")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  saveDraft(@Param("id") id: string, @Body() dto: SaveDraftDto, @Request() req: any) {
    return this.importService.saveDraft(id, dto, req.user.id);
  }

  @Post(":id/commit")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  commit(@Param("id") id: string, @Body() dto: CommitJobDto, @Request() req: any) {
    return this.commitService.commit(id, dto.overwrite || false, dto.isPublished || false, req.user.id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  discard(@Param("id") id: string, @Request() req: any) {
    return this.importService.discard(id, req.user.id);
  }

  @Post(":id/retry")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  retry(@Param("id") id: string, @Request() req: any) {
    return this.importService.retry(id, req.user.id);
  }

  @Post(":id/discard-skill")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  discardSkill(@Param("id") id: string, @Request() req: any) {
    return this.importService.discard(id, req.user.id);
  }

  @Post("group/:groupId/abandon")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  abandonGroup(@Param("groupId") groupId: string, @Request() req: any) {
    return this.importService.discardGroup(groupId, req.user.id);
  }

  @Post("group/:groupId/commit")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  commitGroup(@Param("groupId") groupId: string, @Body() dto: CommitJobDto, @Request() req: any) {
    return this.commitService.commitGroup(groupId, dto.isPublished || false, req.user.id);
  }
}
