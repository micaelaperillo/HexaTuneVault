import { Expose } from 'class-transformer';

export class AlbumResponseDto {
  @Expose()
  readonly name!: string;

  @Expose()
  readonly cover!: string;

  @Expose()
  readonly release_date!: Date;

  @Expose()
  readonly total_tracks!: number;

  @Expose()
  readonly artists!: string[];

  @Expose()
  readonly external_urls!: Record<string, string>;

  @Expose()
  readonly self!: `/${string}`;

  @Expose()
  readonly reviews!: `/${string}`;
}
