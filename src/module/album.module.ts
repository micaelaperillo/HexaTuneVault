import { Module } from '@nestjs/common';

import { AlbumController } from '../controller/album.controller';
import { ExternalApiModule } from '../infrastructure/api/api.module';

import {
  SpotifyAlbumProvider,
  ALBUM_PROVIDER,
} from '../adapter/album.provider';

import {
  AlbumService,
  GET_ALBUM,
  SEARCH_ALBUM,
} from '../use-case/album.service';

@Module({
  imports: [ExternalApiModule],
  controllers: [AlbumController],
  providers: [
    { provide: ALBUM_PROVIDER, useClass: SpotifyAlbumProvider },
    { provide: GET_ALBUM, useClass: AlbumService },
    { provide: SEARCH_ALBUM, useClass: AlbumService },
  ],
})
export class AlbumModule {}
