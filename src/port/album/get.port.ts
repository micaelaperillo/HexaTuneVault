import type { AlbumModel } from '../../model/album.model';
import type { AlbumFilters } from '../../model/album.filter';

export const GET_ALBUM = Symbol('IGetAlbum');

export interface IGetAlbum {
  /**
   * Get an album by filter
   *
   * @param filters The album filters
   * @returns The album, null if not found
   */
  get(filters: AlbumFilters): Promise<AlbumModel | null>;
}
