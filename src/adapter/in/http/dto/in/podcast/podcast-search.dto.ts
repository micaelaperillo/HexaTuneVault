import {
  IsBooleanString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrimString } from '../../transforms';

export class PodcastSearchDto {
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly q!: string;

  @IsOptional()
  @IsBooleanString()
  readonly explicit?: string;

  @IsOptional()
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly media_type?: string;

  @IsOptional()
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly market?: string;

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
