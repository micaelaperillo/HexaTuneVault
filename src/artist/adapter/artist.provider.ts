import { SpotifyApi } from '@spotify/web-api-ts-sdk';

import { ArtistProviderError } from '../exceptions';
import { type ArtistFilters, ArtistEntity } from '../entity';
import { IArtistProvider } from '../repository/artist.provider';

export class ArtistProvider implements IArtistProvider {
  /**
   * @todo This shouldn't be hardcoded like this,
   * maybe using injection once more...
   *
   * Injection-ception :)
   */
  private readonly spotify: SpotifyApi;

  constructor() {
    this.spotify = SpotifyApi.withClientCredentials('', '', ['']);
  }

  /**
   * @override
   */
  async search(filters: ArtistFilters): Promise<ArtistEntity[]> {
    try {
      const { artists } = await this.spotify.search(filters.name, ['artist']);

      return artists.items.map(
        (e) => new ArtistEntity(e.name, e.genres.join(' ')),
      );
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      throw new ArtistProviderError(e);
    }
  }
}
