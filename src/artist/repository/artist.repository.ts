import type { ArtistEntity } from '../entity';

// Documentation import
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ArtistRepositoryError } from '../exceptions';

export interface IArtistRepository {
  /**
   * Create a new artist in the repository
   *
   * @param artist The artist entry to create
   * @returns The created entity
   * @throws {ArtistRepositoryError} On repository failure
   */
  create(artist: Omit<ArtistEntity, 'createdAt'>): Promise<ArtistEntity>;

  /**
   * Get an artist by id
   *
   * @param id The artist id
   * @returns The artist entity, null if not found
   * @throws {ArtistRepositoryError} On repository failure
   */
  get(name: ArtistEntity['name']): Promise<ArtistEntity | null>;
}
