import { Expose } from 'class-transformer';

export class PodcastResponseDto {
  @Expose()
  readonly name!: string;

  @Expose()
  readonly avatar!: string;

  @Expose()
  readonly publisher!: string;

  @Expose()
  readonly description!: string;

  @Expose()
  readonly total_episodes!: number;

  @Expose()
  readonly external_urls!: Record<string, string>;

  @Expose()
  readonly self!: `/${string}`;

  @Expose()
  readonly episodes!: `/${string}`;

  @Expose()
  readonly reviews!: `/${string}`;
}
