import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TrimString } from './transforms';

export class AlbumFilterDto {
  @IsOptional()
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly q?: string;

  @IsOptional()
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly artist?: string;

  @IsOptional()
  @IsNumber()
  @Transform(Number)
  @Min(0)
  readonly year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  readonly page_size: number = 10;
}
