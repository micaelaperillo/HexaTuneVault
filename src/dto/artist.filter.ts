import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ArtistFilterDto {
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  readonly q!: string;

  @IsOptional()
  @Transform(
    ({ value }) => (Array.isArray(value) ? value : [value]) as unknown[],
  )
  @IsString({ each: true })
  @Transform(({ value }) => (value as string[]).map((s) => s.trim()))
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
