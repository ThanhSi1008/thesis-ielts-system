import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class AdminImportDictationYoutubeDto {
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
