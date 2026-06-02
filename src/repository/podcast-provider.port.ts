import type { PodcastModel, PodcastFilters, Page } from '../model';

export const PODCAST_PROVIDER = Symbol('IPodcastProvider');

export interface IPodcastProvider {
  /**
   * Search for podcasts given a filter
   *
   * @param filters The conditional filters to search by (incl. pagination)
   * @returns A page of matching podcasts
   * @throws {PodcastProviderError} On provider failure
   */
  search(filters: PodcastFilters): Promise<Page<PodcastModel>>;

  /**
   * Get a podcast given a filter
   *
   * @param filters The conditional filters to get by
   * @returns The podcast data
   * @throws {PodcastProviderError} On provider failure
   */
  get(filters: PodcastFilters): Promise<PodcastModel | null>;
}
