import type { PodcastModel, PodcastFilters, Page } from '../../../model';

export const SEARCH_PODCAST = Symbol('ISearchPodcast');

export interface ISearchPodcast {
  /**
   * Search podcasts.
   *
   * @param filters The search filters (including optional pagination)
   * @returns A page of podcasts found
   */
  search(filters: PodcastFilters): Promise<Page<PodcastModel>>;
}
