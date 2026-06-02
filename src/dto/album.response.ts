export type AlbumResponse = {
  readonly name: string;
  readonly cover: string;
  readonly releaseDate: string;
  readonly totalTracks: number;
  readonly artists: string[];
  readonly external_urls: Record<string, string>;
  readonly self: `/${string}`;
  readonly reviews: `/${string}`;
};
