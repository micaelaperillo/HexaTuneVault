import { TrimString } from '../../transforms';
import { IsNotEmpty, IsString } from 'class-validator';

export class ArtistGetDto {
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly name!: string;
}
