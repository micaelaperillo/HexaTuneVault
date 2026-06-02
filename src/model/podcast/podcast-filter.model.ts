import type { PageableFilters } from '../page.model';

export type PodcastFilters = PageableFilters & {
  readonly name: string;
  readonly explicit?: boolean;
  readonly mediaType?: string;
  readonly market?: string;
};
