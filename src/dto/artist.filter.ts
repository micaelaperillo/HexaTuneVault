import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TrimString, TrimStringArray } from './transforms';

export class ArtistFilterDto {
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly q!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value) ? value.map((item: unknown) => item) : [value],
  )
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
