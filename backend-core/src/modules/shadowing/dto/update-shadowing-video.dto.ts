import { IsString, IsOptional } from "class-validator";

export class UpdateShadowingVideoDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  folder?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
