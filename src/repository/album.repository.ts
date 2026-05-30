import type { AlbumModel, AlbumFilters } from '../model';

export const ALBUM_REPOSITORY = Symbol('IAlbumRepository');

export interface IAlbumRepository {
  /**
   * Save an album to the database
   */
  save(album: AlbumModel): Promise<AlbumModel>;

  /**
   * Retrieve a specific album from the database matching the filter
   */
  get(filters: AlbumFilters): Promise<AlbumModel | null>;

  /**
   * Search for albums stored in the database matching the filter
   */
  search(filters: AlbumFilters): Promise<AlbumModel[]>;
}
