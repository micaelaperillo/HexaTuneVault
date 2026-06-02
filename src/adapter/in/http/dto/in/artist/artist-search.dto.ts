import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrimString, TrimStringArray, ToArray } from '../../transforms';

export class ArtistSearchDto {
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly q!: string;

  @IsOptional()
  @ToArray()
  @IsString({ each: true })
  @TrimStringArray()
  @IsNotEmpty({ each: true })
  readonly genre?: string[];

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
