import type { PageableFilters } from './page.model';

export type ArtistFilters = PageableFilters & {
  readonly name: string;
  readonly genre?: string[];
};
