import type { ArtistModel, ArtistFilters } from '../model';

// Documentation import
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ArtistProviderError } from '../error/artist';

export const ARTIST_PROVIDER = Symbol('IArtistProvider');

export interface IArtistProvider {
  /**
   * Search for an artist given a filter
   *
   * @param filters The conditional filters to search by
   * @returns The matching artists
   * @throws {ArtistProviderError} On provider failure
   */
  search(filters: ArtistFilters): Promise<ArtistModel[]>;

  /**
   * Get an artist given a filter
   *
   * @param filters The conditional filters to get by
   * @returns The artist data
   * @throws {ArtistProviderError} On provider failure
   */
  get(filters: ArtistFilters): Promise<ArtistModel | null>;
}
