import type { PageableFilters } from './page.model';

export interface AlbumFilters extends PageableFilters {
  readonly name?: string;
  readonly artist?: string;
  readonly year?: number;
}
