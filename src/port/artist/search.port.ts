import type { ArtistModel, ArtistFilters } from '../../model';

export interface ISearchArtist {
  /**
   * Search an artist
   *
   * @param filters The search filters
   * @returns The artists found
   */
  search(filters: ArtistFilters): Promise<ArtistModel[]>;
}
