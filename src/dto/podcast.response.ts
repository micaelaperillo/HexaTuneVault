import { PodcastModel } from 'src/model';

export class PodcastResponseDto {
  readonly name: string;
  readonly avatar: string;
  readonly publisher: string;
  readonly external_urls: Record<string, string>;
  readonly self: `/${string}`;
  readonly episodes: `/${string}`;
  readonly reviews: `/${string}`;

  constructor({ name, avatar, publisher, external_urls }: PodcastModel) {
    this.name = name;
    this.avatar = avatar;
    this.publisher = publisher;
    this.external_urls = external_urls;

    const params = new URLSearchParams({ podcast: name }).toString();

    this.self = `/api/podcasts/${encodeURIComponent(name)}`;
    this.episodes = `/api/episodes?${params}`;
    this.reviews = `/api/reviews?${params}`;
  }

  static from(this: void, model: PodcastModel): PodcastResponseDto {
    return new PodcastResponseDto(model);
  }

  static fromMany(models: PodcastModel[]): PodcastResponseDto[] {
    return models.map(PodcastResponseDto.from);
  }
}
