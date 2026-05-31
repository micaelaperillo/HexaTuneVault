import type { PodcastModel, PodcastFilters } from '../../model';

export const GET_PODCAST = Symbol('IGetPodcast');

export interface IGetPodcast {
  /**
   * Get a podcast by filter
   *
   * @param filter The podcast filter
   * @returns The podcast, null if not found
   */
  get(filter: PodcastFilters): Promise<PodcastModel | null>;
}
