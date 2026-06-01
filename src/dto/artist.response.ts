import { Expose } from 'class-transformer';

export class ArtistResponseDto {
  @Expose()
  readonly name!: string;

  @Expose()
  readonly avatar!: string;

  @Expose()
  readonly external_urls!: Record<string, string>;

  @Expose()
  readonly self!: `/${string}`;

  @Expose()
  readonly albums!: `/${string}`;

  @Expose()
  readonly reviews!: `/${string}`;
}
