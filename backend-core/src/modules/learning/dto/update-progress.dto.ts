import { IsString, IsNotEmpty, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @IsOptional()
  completed?: boolean;
}
