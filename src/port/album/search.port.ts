import type { AlbumModel } from '../../model/album.model';
import type { AlbumFilters } from '../../model/album.filter';

export const SEARCH_ALBUM = Symbol('ISearchAlbum');

export interface ISearchAlbum {
  /**
   * Search an album
   *
   * @param filters The search filters
   * @returns The albums found
   */
  search(filters: AlbumFilters): Promise<AlbumModel[]>;
}
