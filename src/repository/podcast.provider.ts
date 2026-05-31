import type { PodcastModel, PodcastFilters } from '../model';

// Documentation import
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { PodcastProviderError } from '../error/podcast';

export const PODCAST_PROVIDER = Symbol('IPodcastProvider');

export interface IPodcastProvider {
  /**
   * Search for a podcast given a filter
   *
   * @param filters The conditional filters to search by
   * @returns The matching podcasts
   * @throws {PodcastProviderError} On provider failure
   */
  search(filters: PodcastFilters): Promise<PodcastModel[]>;

  /**
   * Get a podcast given a filter
   *
   * @param filters The conditional filters to get by
   * @returns The podcast data
   * @throws {PodcastProviderError} On provider failure
   */
  get(filters: PodcastFilters): Promise<PodcastModel | null>;
}
