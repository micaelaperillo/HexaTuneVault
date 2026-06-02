import type { SpotifyApi, Artist } from '@spotify/web-api-ts-sdk';

import type { ArtistModel, ArtistFilters, Page } from '../../model';
import type { IArtistProvider } from '../../port/out';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { SPOTIFY_API } from './spotify.provider';
import { ArtistProviderError } from './artist-provider.error';
import { resolveSpotifyPage } from './spotify-pagination';
import { escapeSpotifyTerm } from './spotify-query';
import { MapErrors } from 'error-mapper-decorator';

export { ARTIST_PROVIDER } from '../../port/out';

@Injectable()
export class SpotifyArtistProvider implements IArtistProvider {
  private readonly logger = new Logger(SpotifyArtistProvider.name);

  constructor(@Inject(SPOTIFY_API) private readonly spotify: SpotifyApi) {}

  /**
   * @override
   */
  @MapErrors({ from: Error, to: (e) => new ArtistProviderError(e) })
  async search(filters: ArtistFilters): Promise<Page<ArtistModel>> {
    const query = SpotifyArtistProvider.toQuery(filters);
    const { page, pageSize, limit, offset } = resolveSpotifyPage(filters);
    this.logger.debug(query);

    const { artists } = await this.spotify.search(
      query,
      ['artist'],
      undefined,
      limit,
      offset,
    );
    this.logger.debug(artists.items);

    const items = artists.items
      .filter((a) => a.images.length)
      .map(SpotifyArtistProvider.toModel);

    return { items, total: artists.total, page, pageSize };
  }

  /**
   * @override
   */
  async get(filters: ArtistFilters): Promise<ArtistModel | null> {
    return (await this.search(filters)).items[0] ?? null;
  }

  private static toQuery(filters: ArtistFilters) {
    const token = ' genre:';
    const name = escapeSpotifyTerm(filters.name);
    const genres = (filters.genre ?? [])
      .map(escapeSpotifyTerm)
      .filter((g) => g.length);
    return name + (genres.length ? `${token}${genres.join(token)}` : '');
  }

  private static toModel(this: void, { name, images, external_urls }: Artist) {
    return {
      name,
      avatar: images[0].url,
      external_urls: { ...external_urls },
    } satisfies ArtistModel;
  }
}
