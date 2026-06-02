import { TrimString } from './transforms';
import { IsNotEmpty, IsString } from 'class-validator';

export class AlbumGetDto {
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly name!: string;
}
