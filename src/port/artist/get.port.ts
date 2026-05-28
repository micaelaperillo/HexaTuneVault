import type { ArtistModel, ArtistFilters } from '../../model';

export interface IGetArtist {
  /**
   * Get an artist by filter
   *
   * @param id The artist filter
   * @returns The artists, null if not found
   */
  get(filter: ArtistFilters): Promise<ArtistModel | null>;
}
