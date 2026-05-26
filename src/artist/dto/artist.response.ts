export type ArtistResponse = {
  readonly name: string;
  readonly avatar: string;
  readonly albums: URL;
  readonly reviews: URL;
  readonly createdAt?: Date;
};
