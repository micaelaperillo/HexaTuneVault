import type { ArtistModel, ArtistFilters, Page } from '../../model';

export const SEARCH_ARTIST = Symbol('ISearchArtist');

export interface ISearchArtist {
  /**
   * Search artists.
   *
   * @param filters The search filters (including optional pagination)
   * @returns A page of artists found
   */
  search(filters: ArtistFilters): Promise<Page<ArtistModel>>;
}
