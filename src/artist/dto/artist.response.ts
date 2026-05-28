export type ArtistResponse = {
  readonly name: string;
  readonly avatar: string;
  readonly self: `/${string}`;
  readonly albums: `/${string}`;
  readonly reviews: `/${string}`;
};
