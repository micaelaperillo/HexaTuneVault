import type { IGetArtist, ISearchArtist } from '../port/artist';
import type { ArtistFilters, ArtistModel } from '../model';

import { type IArtistProvider, ARTIST_PROVIDER } from '../repository';

import { Inject, Injectable } from '@nestjs/common';

export { GET_ARTIST, SEARCH_ARTIST } from '../port/artist';

@Injectable()
export class ArtistService implements ISearchArtist, IGetArtist {
  constructor(@Inject(ARTIST_PROVIDER) private provider: IArtistProvider) {}

  search(filter: ArtistFilters): Promise<ArtistModel[]> {
    return this.provider.search(filter);
  }

  get(filter: ArtistFilters): Promise<ArtistModel | null> {
    return this.provider.get(filter);
  }
}
