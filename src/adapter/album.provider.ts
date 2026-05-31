import type { SpotifyApi, SimplifiedAlbum } from '@spotify/web-api-ts-sdk';

import type { AlbumModel, AlbumFilters } from '../model';
import type { IAlbumProvider } from '../repository';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { SPOTIFY_API } from '../infrastructure/api/provider';
import { AlbumProviderError } from '../error/album';

export { ALBUM_PROVIDER } from '../repository';

@Injectable()
export class SpotifyAlbumProvider implements IAlbumProvider {
  private readonly logger = new Logger(SpotifyAlbumProvider.name);

  constructor(@Inject(SPOTIFY_API) private readonly spotify: SpotifyApi) {}

  /**
   * @override
   */
  async search(filters: AlbumFilters): Promise<AlbumModel[]> {
    try {
      const query = SpotifyAlbumProvider.toQuery(filters);
      this.logger.debug(query);

      const { albums } = await this.spotify.search(query, ['album']);
      this.logger.debug(albums.items);

      return albums.items
        .filter((a) => a.images.length)
        .map(SpotifyAlbumProvider.toModel);
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      throw new AlbumProviderError(error);
    }
  }

  /**
   * @override
   */
  async get(filters: AlbumFilters): Promise<AlbumModel | null> {
    return (await this.search(filters))[0] ?? null;
  }

  private static toQuery(filters: AlbumFilters) {
    const params: string[] = [];

    if (filters.name) {
      params.push(`album:${filters.name}`);
    }

    if (filters.artist) {
      params.push(`artist:${filters.artist}`);
    }

    return params.join(' ');
  }

  private static toModel(
    this: void,
    { name, images, release_date, total_tracks, artists }: SimplifiedAlbum,
  ) {
    return {
      name,
      cover: images[0].url,
      releaseDate: release_date,
      totalTracks: total_tracks,
      artists: artists.map((a) => a.name),
    };
  }
}
