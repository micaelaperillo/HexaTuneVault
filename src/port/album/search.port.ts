import type { AlbumModel, AlbumFilters, Page } from '../../model';

export const SEARCH_ALBUM = Symbol('ISearchAlbum');

export interface ISearchAlbum {
  /**
   * Search albums.
   *
   * @param filters The search filters (including optional pagination)
   * @returns A page of albums found
   */
  search(filters: AlbumFilters): Promise<Page<AlbumModel>>;
}
