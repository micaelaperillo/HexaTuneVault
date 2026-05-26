export type ArtistResponse = {
  readonly name: string;
  readonly avatar: string;
  readonly albums: `/${string}`;
  readonly reviews: `/${string}`;
  readonly createdAt?: Date;
};
