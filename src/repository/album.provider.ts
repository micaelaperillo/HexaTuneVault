import type { AlbumModel } from '../model/album.model';
import type { AlbumFilters } from '../model/album.filter';

export const ALBUM_PROVIDER = Symbol('IAlbumProvider');

export interface IAlbumProvider {
  /**
   * Search for an album given a filter
   *
   * @param filters The conditional filters to search by
   * @returns The matching albums
   * @throws {AlbumProviderError} On provider failure
   */
  search(filters: AlbumFilters): Promise<AlbumModel[]>;

  /**
   * Get an album given a filter
   *
   * @param filters The conditional filters to get by
   * @returns The album data
   * @throws {AlbumProviderError} On provider failure
   */
  get(filters: AlbumFilters): Promise<AlbumModel | null>;
}
