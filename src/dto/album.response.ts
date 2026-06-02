import { Expose } from 'class-transformer';

export class AlbumResponseDto {
  @Expose()
  readonly name!: string;

  @Expose()
  readonly cover!: string;

  @Expose()
  readonly releaseDate!: Date;

  @Expose()
  readonly totalTracks!: number;

  @Expose()
  readonly artists!: string[];

  @Expose()
  readonly external_urls!: Record<string, string>;

  @Expose()
  readonly self!: `/${string}`;

  @Expose()
  readonly reviews!: `/${string}`;
}
