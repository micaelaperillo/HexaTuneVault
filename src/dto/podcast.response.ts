import { PodcastModel } from 'src/model';

export class PodcastResponseDto {
  readonly name: string;
  readonly avatar: string;
  readonly publisher: string;
  readonly description: string;
  readonly total_episodes: number;
  readonly external_urls: Record<string, string>;
  readonly self: `/${string}`;
  readonly episodes: `/${string}`;
  readonly reviews: `/${string}`;

  constructor({
    name,
    avatar,
    publisher,
    description,
    total_episodes,
    external_urls,
  }: PodcastModel) {
    this.name = name;
    this.avatar = avatar;
    this.publisher = publisher;
    this.description = description;
    this.total_episodes = total_episodes;
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
