import type { IGetAlbum, ISearchAlbum } from '../port/in/album';
import type { AlbumFilters, AlbumModel, Page } from '../model';

import { type IAlbumProvider, ALBUM_PROVIDER } from '../port/out';

import { Inject, Injectable } from '@nestjs/common';

export { GET_ALBUM, SEARCH_ALBUM } from '../port/in/album';

@Injectable()
export class AlbumService implements ISearchAlbum, IGetAlbum {
  constructor(
    @Inject(ALBUM_PROVIDER) private readonly provider: IAlbumProvider,
  ) {}

  async search(filter: AlbumFilters): Promise<Page<AlbumModel>> {
    return this.provider.search(filter);
  }

  async get(filter: AlbumFilters): Promise<AlbumModel | null> {
    return this.provider.get(filter);
  }
}
