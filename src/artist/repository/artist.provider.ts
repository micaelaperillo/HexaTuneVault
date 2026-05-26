import { ArtistFilters, ArtistEntity } from '../entity';

// Documentation import
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ArtistProviderError } from '../exceptions';

export interface IArtistProvider {
  /**
   * Search for an artist given a filter
   *
   * @param filters The conditional filters to search by
   * @returns The matching artists
   * @throws {ArtistProviderError} On provider failure
   */
  search(filters: ArtistFilters): Promise<ArtistEntity[]>;
}
