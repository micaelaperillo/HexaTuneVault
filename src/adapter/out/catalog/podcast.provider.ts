import type {
  SpotifyApi,
  SimplifiedShow,
  Market,
} from '@spotify/web-api-ts-sdk';

import type { PodcastModel, PodcastFilters, Page } from '../../../model';
import type { IPodcastProvider } from '../../../port/out';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { SPOTIFY_API } from './spotify.provider';
import { PodcastProviderError } from './podcast-provider.error';
import { resolveSpotifyPage } from './spotify-pagination';
import { MapErrors } from 'error-mapper-decorator';

export { PODCAST_PROVIDER } from '../../../port/out';

// Spotify only returns shows scoped to a market; default when the caller
// does not specify one so searches return results out of the box.
const DEFAULT_MARKET: Market = 'US';

@Injectable()
export class SpotifyPodcastProvider implements IPodcastProvider {
  private readonly logger = new Logger(SpotifyPodcastProvider.name);

  constructor(@Inject(SPOTIFY_API) private readonly spotify: SpotifyApi) {}

  /**
   * @override
   */
  @MapErrors({ from: Error, to: (e) => new PodcastProviderError(e) })
  async search(filters: PodcastFilters): Promise<Page<PodcastModel>> {
    const market = (filters.market as Market) || DEFAULT_MARKET;
    const { page, pageSize, limit, offset } = resolveSpotifyPage(filters);
    this.logger.debug(`${filters.name} (market=${market})`);

    const { shows } = await this.spotify.search(
      filters.name,
      ['show'],
      market,
      limit,
      offset,
    );
    this.logger.debug(shows.items);

    const items = shows.items
      .filter((s) => s && s.images.length)
      .filter((s) => SpotifyPodcastProvider.matchesFilters(s, filters))
      .map(SpotifyPodcastProvider.toModel);

    return { items, total: shows.total, page, pageSize };
  }

  /**
   * @override
   */
  async get(filters: PodcastFilters): Promise<PodcastModel | null> {
    return (await this.search(filters)).items[0] ?? null;
  }

  private static matchesFilters(
    show: SimplifiedShow,
    filters: PodcastFilters,
  ): boolean {
    if (filters.explicit !== undefined && show.explicit !== filters.explicit) {
      return false;
    }
    if (
      filters.mediaType &&
      show.media_type?.toLowerCase() !== filters.mediaType.toLowerCase()
    ) {
      return false;
    }
    return true;
  }

  private static toModel(
    this: void,
    {
      name,
      images,
      publisher,
      description,
      total_episodes,
      external_urls,
    }: SimplifiedShow,
  ) {
    return {
      name,
      avatar: images[0].url,
      publisher,
      description,
      total_episodes,
      external_urls: { ...external_urls },
    } satisfies PodcastModel;
  }
}
