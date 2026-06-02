import type { SpotifyApi, SimplifiedAlbum } from '@spotify/web-api-ts-sdk';

import type { AlbumModel, AlbumFilters, Page } from '../model';
import type { IAlbumProvider } from '../repository';

import { Inject, Injectable, Logger } from '@nestjs/common';

import { SPOTIFY_API } from '../infrastructure/api/provider';
import { AlbumProviderError } from '../error/album';
import { resolveSpotifyPage } from './spotify-pagination';

export { ALBUM_PROVIDER } from '../repository';

@Injectable()
export class SpotifyAlbumProvider implements IAlbumProvider {
  private readonly logger = new Logger(SpotifyAlbumProvider.name);

  constructor(@Inject(SPOTIFY_API) private readonly spotify: SpotifyApi) {}

  /**
   * @override
   */
  async search(filters: AlbumFilters): Promise<Page<AlbumModel>> {
    try {
      const query = SpotifyAlbumProvider.toQuery(filters);
      const { page, pageSize, limit, offset } = resolveSpotifyPage(filters);
      this.logger.debug(query);

      const { albums } = await this.spotify.search(
        query,
        ['album'],
        undefined,
        limit as Parameters<SpotifyApi['search']>[3],
        offset,
      );
      this.logger.debug(albums.items);

      const items = albums.items
        .filter((a) => a.images.length)
        .map(SpotifyAlbumProvider.toModel);

      return { items, total: albums.total, page, pageSize };
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      throw new AlbumProviderError(error);
    }
  }

  /**
   * @override
   */
  async get(filters: AlbumFilters): Promise<AlbumModel | null> {
    return (await this.search(filters)).items[0] ?? null;
  }

  private static toQuery(filters: AlbumFilters) {
    const params: string[] = [];

    if (filters.name) {
      params.push(filters.name);
    }

    if (filters.artist) {
      params.push(filters.artist);
    }

    if (filters.year) {
      params.push(`year:${filters.year}`);
    }

    return params.join(' ');
  }

  private static toModel(
    this: void,
    {
      name,
      images,
      release_date,
      total_tracks,
      artists,
      external_urls,
    }: SimplifiedAlbum,
  ): AlbumModel {
    return {
      name,
      cover: images[0].url,
      releaseDate: new Date(release_date),
      totalTracks: total_tracks,
      artists: artists.map((a) => a.name),
      external_urls: { ...external_urls },
    };
  }
}
