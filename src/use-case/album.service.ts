import type { IGetAlbum, ISearchAlbum } from '../port/album';
import type { AlbumFilters, AlbumModel } from '../model';

import {
  type IAlbumProvider,
  ALBUM_PROVIDER,
  type IAlbumRepository,
  ALBUM_REPOSITORY,
} from '../repository';

import { Inject, Injectable } from '@nestjs/common';

export { GET_ALBUM, SEARCH_ALBUM } from '../port/album';

@Injectable()
export class AlbumService implements ISearchAlbum, IGetAlbum {
  constructor(
    @Inject(ALBUM_PROVIDER) private readonly provider: IAlbumProvider,
    @Inject(ALBUM_REPOSITORY) private readonly repository: IAlbumRepository,
  ) {}

  async search(filter: AlbumFilters): Promise<AlbumModel[]> {
    const results = await this.provider.search(filter);

    for (const album of results) {
      await this.repository
        .save(album)
        .catch((err) => console.error('DB Save Error:', err));
    }

    return results;
  }

  async get(filter: AlbumFilters): Promise<AlbumModel | null> {
    // Try local DB cache first
    const cached = await this.repository.get(filter).catch((err) => {
      console.error('DB Get Error:', err);
      return null;
    });
    if (cached) {
      console.log('Cache Hit for Album:', filter.name);
      return cached;
    }

    // Fallback to Spotify provider
    const album = await this.provider.get(filter);
    if (album) {
      await this.repository
        .save(album)
        .catch((err) => console.error('DB Save Error:', err));
    }

    return album;
  }
}
