import type { IGetArtist, ISearchArtist } from '../port/in/artist';
import type { ArtistFilters, ArtistModel, Page } from '../model';

import { type IArtistProvider, ARTIST_PROVIDER } from '../port/out';

import { Inject, Injectable } from '@nestjs/common';

export { GET_ARTIST, SEARCH_ARTIST } from '../port/in/artist';

@Injectable()
export class ArtistService implements ISearchArtist, IGetArtist {
  constructor(
    @Inject(ARTIST_PROVIDER) private readonly provider: IArtistProvider,
  ) {}

  search(filter: ArtistFilters): Promise<Page<ArtistModel>> {
    return this.provider.search(filter);
  }

  get(filter: ArtistFilters): Promise<ArtistModel | null> {
    return this.provider.get(filter);
  }
}
