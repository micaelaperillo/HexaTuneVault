import type { IArtistProvider } from '../repository/artist.provider';
import type { ArtistModel, ArtistFilters } from '../model';

import { SpotifyApi, type Artist } from '@spotify/web-api-ts-sdk';
import { Injectable, Logger } from '@nestjs/common';

import { ArtistProviderError } from '../errors';

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
  async search(filters: ArtistFilters): Promise<ArtistModel[]> {
    try {
      const { artists } = await this.spotify.search(filters.name, ['artist']);
      this.logger.debug(artists.items.at(0));

      return artists.items.map(SpotifyArtistProvider.toModel);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      throw new ArtistProviderError(e);
    }
  }

  /**
   * @override
   */
  async get(filters: ArtistFilters): Promise<ArtistModel | null> {
    return (await this.search(filters))[0] ?? null;
  }

  private static toModel(this: void, { name, images }: Artist) {
    return {
      name,
      avatar: images[0].url,
    };
  }
}
