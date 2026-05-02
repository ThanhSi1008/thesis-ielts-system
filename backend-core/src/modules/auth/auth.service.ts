import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RegisterDto } from "./dto/auth.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

// Safe user type (no password field)
type SafeUser = Omit<User, "password">;

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>("GOOGLE_CLIENT_ID"),
    );
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, "password"> | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) return null;
    if (await bcrypt.compare(password, user.password)) {
      const { password: _pw, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto): Promise<SafeUser> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          role: (registerDto.role as any) || "STUDENT",
        },
      });

      await this.prisma.deck.create({
        data: { userId: user.id, name: "Default" },
      });

      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error.code === "P2002") {
        throw new BadRequestException("Email already exists");
      }
      throw error;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async googleLogin(idToken: string) {
    const clientId = this.configService.get<string>("GOOGLE_CLIENT_ID");

    // 1. Verify the ID token with Google
    let ticket: any;
    try {
      ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });
    } catch {
      throw new UnauthorizedException("Invalid Google ID token");
    }

    const payload = ticket.getPayload();
    const googleId: string = payload["sub"];
    const email: string = payload["email"];
    const firstName: string = payload["given_name"] || "";
    const lastName: string = payload["family_name"] || "";
    const avatar: string = payload["picture"] || "";

    // 2. Find or create user — link by googleId first, then by email
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      // Existing user: link Google ID if not already linked
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: avatar || user.avatar },
        });
      }
    } else {
      // New user: create without password
      user = await this.prisma.user.create({
        data: {
          email,
          googleId,
          avatar,
          firstName,
          lastName,
          role: "STUDENT",
        },
      });

      // Create default Vocab Lab deck
      await this.prisma.deck.create({
        data: { userId: user.id, name: "Default" },
      });
    }

    // 3. Issue JWT — same as regular login
    const { password: _pw, ...safeUser } = user;
    const jwtPayload = { email: user.email, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(jwtPayload),
      user: safeUser,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new BadRequestException("User not found");

    // Block Google OAuth users from changing password
    if (!user.password) {
      throw new BadRequestException(
        "Your account uses Google sign-in. Password change is not available.",
      );
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new BadRequestException("Current password is incorrect");

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password changed successfully" };
  }
}
