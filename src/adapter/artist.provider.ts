import type { SpotifyApi, Artist } from '@spotify/web-api-ts-sdk';

import type { ArtistModel, ArtistFilters } from '../model';
import type { IArtistProvider } from '../repository';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { SPOTIFY_API } from '../infrastructure/api/provider';
import { ArtistProviderError } from '../error/artist';

export { ARTIST_PROVIDER } from '../repository';

@Injectable()
export class SpotifyArtistProvider implements IArtistProvider {
  private readonly logger = new Logger(SpotifyArtistProvider.name);

  constructor(@Inject(SPOTIFY_API) private readonly spotify: SpotifyApi) {}

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
