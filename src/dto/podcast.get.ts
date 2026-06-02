import { TrimString } from './transforms';
import { IsNotEmpty, IsString } from 'class-validator';

export class PodcastGetDto {
  @IsString()
  @TrimString()
  @IsNotEmpty()
  readonly name!: string;
}
