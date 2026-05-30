import { ArtistModel } from '../model/artist.model';

export class ArtistResponseDto {
  readonly name: string;
  readonly avatar: string;
  readonly external_urls: Record<string, string>;
  readonly self: `/${string}`;
  readonly albums: `/${string}`;
  readonly reviews: `/${string}`;

  constructor({ name, avatar, external_urls }: ArtistModel) {
    this.name = name;
    this.avatar = avatar;
    this.external_urls = external_urls;

    const params = new URLSearchParams({ artist: name }).toString();

    this.self = `/api/artists/${encodeURIComponent(name)}`;
    this.albums = `/api/albums?${params}`;
    this.reviews = `/api/reviews?${params}`;
  }

  static from(this: void, model: ArtistModel): ArtistResponseDto {
    return new ArtistResponseDto(model);
  }

  static fromMany(models: ArtistModel[]): ArtistResponseDto[] {
    return models.map(ArtistResponseDto.from);
  }
}
