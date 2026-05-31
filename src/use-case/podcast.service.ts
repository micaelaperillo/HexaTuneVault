import type { IGetPodcast, ISearchPodcast } from '../port/podcast';
import type { PodcastFilters, PodcastModel } from '../model';

import { type IPodcastProvider, PODCAST_PROVIDER } from '../repository';

import { Inject, Injectable } from '@nestjs/common';

export { GET_PODCAST, SEARCH_PODCAST } from '../port/podcast';

@Injectable()
export class PodcastService implements ISearchPodcast, IGetPodcast {
  constructor(
    @Inject(PODCAST_PROVIDER) private readonly provider: IPodcastProvider,
  ) {}

  search(filter: PodcastFilters): Promise<PodcastModel[]> {
    return this.provider.search(filter);
  }

  get(filter: PodcastFilters): Promise<PodcastModel | null> {
    return this.provider.get(filter);
  }
}
