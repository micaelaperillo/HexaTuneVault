import type { ArtistModel } from './model';
import type { IGetArtist, ISearchArtist } from './port';
import type { IArtistProvider, IArtistRepository } from './repository';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ArtistService implements ISearchArtist, IGetArtist {
  constructor(
    @Inject('IArtistRepository') private repository: IArtistRepository,
    @Inject('IArtistProvider') private provider: IArtistProvider,
  ) {}

  search(name: string): Promise<ArtistModel[]> {
    return this.provider.search({ name });
  }

  async get(name: string): Promise<ArtistModel | null> {
    const artist = await this.repository.get(name);
    return artist || this.create(name);
  }

  private async create(name: string) {
    const search = await this.provider.search({ name });
    if (!search.length) return null;
    return this.repository.create(search[0]);
  }
}
