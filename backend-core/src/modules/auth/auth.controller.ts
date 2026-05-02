import { Controller, Post, Body, UseGuards, Request, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RegisterDto } from "./dto/auth.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { GoogleAuthDto } from "./dto/google-auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post("refresh")
  async refresh(@Body() refreshDto: any) {
    // TODO: Implement refresh token logic
    return { message: "Refresh token endpoint - to be implemented" };
  }

  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto);
  }

  @Post("google")
  async googleLogin(@Body() dto: GoogleAuthDto) {
    return this.authService.googleLogin(dto.idToken);
  }
}
