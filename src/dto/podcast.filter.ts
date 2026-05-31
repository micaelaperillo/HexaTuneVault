import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class PodcastFilterDto {
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  readonly q!: string;

  @IsOptional()
  @IsBooleanString()
  readonly explicit?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  readonly media_type?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  readonly market?: string;
}
