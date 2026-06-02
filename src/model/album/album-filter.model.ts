import type { PageableFilters } from '../page.model';

export type AlbumFilters = PageableFilters & {
  readonly name?: string;
  readonly artist?: string;
  readonly year?: number;
};
