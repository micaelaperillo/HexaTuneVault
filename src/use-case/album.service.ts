import type { IGetAlbum, ISearchAlbum } from '../port/album';
import type { AlbumFilters, AlbumModel } from '../model';

import { type IAlbumProvider, ALBUM_PROVIDER } from '../repository';

import { Inject, Injectable } from '@nestjs/common';

export { GET_ALBUM, SEARCH_ALBUM } from '../port/album';

@Injectable()
export class AlbumService implements ISearchAlbum, IGetAlbum {
  constructor(
    @Inject(ALBUM_PROVIDER) private readonly provider: IAlbumProvider,
  ) {}

  search(filter: AlbumFilters): Promise<AlbumModel[]> {
    return this.provider.search(filter);
  }

  get(filter: AlbumFilters): Promise<AlbumModel | null> {
    return this.provider.get(filter);
  }
}
