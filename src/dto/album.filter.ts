import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AlbumFilterDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  readonly q?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  readonly artist?: string;

  @IsOptional()
  @IsNumber()
  @Transform(Number)
  @Min(0)
  readonly year?: number;
}
