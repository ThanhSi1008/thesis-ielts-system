import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from "class-validator";

export class RegisterDto {
  @IsEmail({}, { message: "Invalid email format" })
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsIn(["STUDENT", "TEACHER"], { message: "Role must be STUDENT or TEACHER" })
  role?: "STUDENT" | "TEACHER";
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
