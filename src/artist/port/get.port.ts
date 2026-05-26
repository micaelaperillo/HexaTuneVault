import { ArtistModel } from '../model';

export interface IGetArtist {
  /**
   * Get an artist by name
   *
   * @param id The artist name
   * @returns The artists, null if not found
   */
  get(name: string): Promise<ArtistModel | null>;
}
