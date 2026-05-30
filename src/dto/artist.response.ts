export type ArtistResponse = {
  readonly name: string;
  readonly avatar: string;
  readonly external_urls: Record<string, string>;
  readonly self: `/${string}`;
  readonly albums: `/${string}`;
  readonly reviews: `/${string}`;
};
