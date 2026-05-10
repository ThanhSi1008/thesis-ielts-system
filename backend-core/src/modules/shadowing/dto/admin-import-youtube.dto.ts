import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class AdminImportYoutubeDto {
  @IsString()
  @IsNotEmpty()
  youtubeUrl: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  category?: string;
}
