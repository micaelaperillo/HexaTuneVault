import type { ArtistModel, ArtistFilters } from '../model';

export interface IGetArtist {
  /**
   * Get an artist by id (name)
   *
   * @param id The artist name
   * @returns The artists, null if not found
   */
  get(name: ArtistFilters): Promise<ArtistModel | null>;
}
