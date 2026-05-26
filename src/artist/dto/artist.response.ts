export type ArtistResponse = {
  readonly name: string;
  readonly description: string;
  readonly albums: URL;
  readonly reviews: URL;
  readonly createdAt?: Date;
};
