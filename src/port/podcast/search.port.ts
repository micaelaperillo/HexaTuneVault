import type { PodcastModel, PodcastFilters } from '../../model';

export const SEARCH_PODCAST = Symbol('ISearchPodcast');

export interface ISearchPodcast {
  /**
   * Search a podcast
   *
   * @param filters The search filters
   * @returns The podcasts found
   */
  search(filters: PodcastFilters): Promise<PodcastModel[]>;
}
