import type { PageableFilters } from './page.model';

export interface ArtistFilters extends PageableFilters {
  readonly name: string;
  readonly genre?: string[];
}
