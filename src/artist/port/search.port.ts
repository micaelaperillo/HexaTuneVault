import { ArtistModel } from '../model';

export interface ISearchArtist {
  /**
   * Search an artist by name
   *
   * @param name The artist name
   * @returns The artists found
   */
  search(name: string): Promise<ArtistModel[]>;
}
