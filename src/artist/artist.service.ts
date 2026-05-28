import type { IGetArtist, ISearchArtist } from './port';
import type { ArtistFilters, ArtistModel } from './model';
import type { IArtistProvider } from './repository';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ArtistService implements ISearchArtist, IGetArtist {
  constructor(@Inject('IArtistProvider') private provider: IArtistProvider) {}

  search(filter: ArtistFilters): Promise<ArtistModel[]> {
    return this.provider.search(filter);
  }

  get(filter: ArtistFilters): Promise<ArtistModel | null> {
    return this.provider.get(filter);
  }
}
