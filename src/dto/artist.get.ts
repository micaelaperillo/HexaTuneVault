import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class ArtistGetDto {
  @IsString()
  @Transform(({ value }) => (value as string).trim())
  @IsNotEmpty()
  readonly name!: string;
}
