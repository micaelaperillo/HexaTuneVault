import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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
}
