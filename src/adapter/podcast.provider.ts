import type {
  SpotifyApi,
  SimplifiedShow,
  Market,
} from '@spotify/web-api-ts-sdk';

import type { PodcastModel, PodcastFilters } from '../model';
import type { IPodcastProvider } from '../repository';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { SPOTIFY_API } from '../infrastructure/api/provider';
import { PodcastProviderError } from '../error/podcast';

export { PODCAST_PROVIDER } from '../repository';

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
  async search(filters: PodcastFilters): Promise<PodcastModel[]> {
    try {
      const market = (filters.market as Market) || DEFAULT_MARKET;
      this.logger.debug(`${filters.name} (market=${market})`);

      const { shows } = await this.spotify.search(
        filters.name,
        ['show'],
        market,
      );
      this.logger.debug(shows.items);

      return shows.items
        .filter((s) => s && s.images.length)
        .filter((s) => SpotifyPodcastProvider.matchesFilters(s, filters))
        .map(SpotifyPodcastProvider.toModel);
    } catch (e) {
      if (!(e instanceof Error)) throw e;
      throw new PodcastProviderError(e);
    }
  }

  /**
   * @override
   */
  async get(filters: PodcastFilters): Promise<PodcastModel | null> {
    return (await this.search(filters))[0] ?? null;
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
