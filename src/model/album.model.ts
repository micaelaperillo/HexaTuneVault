export type AlbumModel = {
  readonly name: string;
  readonly cover: string;
  readonly releaseDate: string;
  readonly totalTracks: number;
  readonly artists: string[];
  readonly external_urls: Record<string, string>;
};
