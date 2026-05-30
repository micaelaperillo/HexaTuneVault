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
      const artistName = filters.artist;
      if (artistName) {
        const { artists } = await this.spotify.search(artistName, ['artist']);
        const artist = artists.items[0];
        if (!artist) {
          return [];
        }
        const albumsPage = await this.spotify.artists.albums(artist.id);
        return albumsPage.items.map(SpotifyAlbumProvider.toModel);
      }

      const albumName = filters.name;
      if (albumName) {
        const { albums } = await this.spotify.search(albumName, ['album']);
        return albums.items.map(SpotifyAlbumProvider.toModel);
      }

      return [];
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

  private static toModel(
    this: void,
    { name, images, release_date, total_tracks, artists }: SimplifiedAlbum,
  ) {
    return {
      name,
      cover: images[0]?.url ?? '',
      releaseDate: release_date,
      totalTracks: total_tracks,
      artists: artists.map((a) => a.name),
    };
  }
}
