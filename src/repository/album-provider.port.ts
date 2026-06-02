import type { AlbumModel, AlbumFilters, Page } from '../model';

export const ALBUM_PROVIDER = Symbol('IAlbumProvider');

export interface IAlbumProvider {
  /**
   * Search for albums given a filter
   *
   * @param filters The conditional filters to search by (incl. pagination)
   * @returns A page of matching albums
   * @throws {AlbumProviderError} On provider failure
   */
  search(filters: AlbumFilters): Promise<Page<AlbumModel>>;

  /**
   * Get an album given a filter
   *
   * @param filters The conditional filters to get by
   * @returns The album data
   * @throws {AlbumProviderError} On provider failure
   */
  get(filters: AlbumFilters): Promise<AlbumModel | null>;
}
