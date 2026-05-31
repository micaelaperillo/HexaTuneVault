export type PodcastModel = {
  readonly name: string;
  readonly avatar: string;
  readonly publisher: string;
  readonly description: string;
  readonly total_episodes: number;
  readonly external_urls: Record<string, string>;
};
