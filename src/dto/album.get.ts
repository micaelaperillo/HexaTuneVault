import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class AlbumGetDto {
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  readonly name!: string;
}
