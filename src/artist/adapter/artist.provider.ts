import { SpotifyApi } from '@spotify/web-api-ts-sdk';

import { ArtistProviderError } from '../exceptions';
import { type ArtistFilters, ArtistEntity } from '../entity';
import { IArtistProvider } from '../repository/artist.provider';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SpotifyArtistProvider implements IArtistProvider {
  private readonly logger = new Logger(SpotifyArtistProvider.name);

  /**
   * @todo This shouldn't be hardcoded like this,
   * maybe using injection once more...
   *
   * Injection-ception :)
   */
  private readonly spotify: SpotifyApi;

  constructor() {
    this.spotify = SpotifyApi.withClientCredentials(
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!,
    );
  }

  /**
   * @override
   */
  async search(filters: ArtistFilters): Promise<ArtistEntity[]> {
    try {
      const { artists } = await this.spotify.search(filters.name, ['artist']);
      this.logger.debug(artists.items.at(0));

      return artists.items.map(
        (e) => new ArtistEntity(e.name, e.genres.join(' ')),
      );
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      throw new ArtistProviderError(e);
    }
  }
}
