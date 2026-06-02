import type { PageableFilters } from './page.model';

export interface PodcastFilters extends PageableFilters {
  readonly name: string;
  readonly explicit?: boolean;
  readonly mediaType?: string;
  readonly market?: string;
}
