export type AlbumResponse = {
  readonly name: string;
  readonly cover: string;
  readonly releaseDate: string;
  readonly totalTracks: number;
  readonly artists: string[];
  readonly self: `/${string}`;
  readonly reviews: `/${string}`;
};
