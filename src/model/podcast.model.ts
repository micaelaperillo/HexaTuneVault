export type PodcastModel = {
  readonly name: string;
  readonly avatar: string;
  readonly publisher: string;
  readonly external_urls: Record<string, string>;
};
