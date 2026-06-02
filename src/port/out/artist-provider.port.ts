import type { ArtistModel, ArtistFilters, Page } from '../../model';

export const ARTIST_PROVIDER = Symbol('IArtistProvider');

export interface IArtistProvider {
  /**
   * Search for artists given a filter
   *
   * @param filters The conditional filters to search by (incl. pagination)
   * @returns A page of matching artists
   * @throws {ArtistProviderError} On provider failure
   */
  search(filters: ArtistFilters): Promise<Page<ArtistModel>>;

  /**
   * Get an artist given a filter
   *
   * @param filters The conditional filters to get by
   * @returns The artist data
   * @throws {ArtistProviderError} On provider failure
   */
  get(filters: ArtistFilters): Promise<ArtistModel | null>;
}
