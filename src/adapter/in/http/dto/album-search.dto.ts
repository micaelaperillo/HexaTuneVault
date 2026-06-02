import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrimString, ToNumber } from './transforms';
import { AtLeastOneAlbumFilterConstraint } from './validators/at-least-one-album-filter.validator';

export class AlbumSearchDto {
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
  @ToNumber()
  @IsNumber()
  @Min(0)
  readonly year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Validate(AtLeastOneAlbumFilterConstraint)
  readonly page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  readonly page_size: number = 10;
}
