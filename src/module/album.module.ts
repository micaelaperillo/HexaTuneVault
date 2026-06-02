import { Module } from '@nestjs/common';

import { AlbumController } from '../adapter/in/http/album.controller';
import { ExternalApiModule } from '../infrastructure/api/api.module';
import { DatabaseModule } from '../infrastructure/database/database.module';

import { SpotifyAlbumProvider } from '../adapter/out';
import { ALBUM_PROVIDER } from '../port/out';

import {
  AlbumService,
  GET_ALBUM,
  SEARCH_ALBUM,
} from '../use-case/album.service';

@Module({
  imports: [ExternalApiModule, DatabaseModule],
  controllers: [AlbumController],
  providers: [
    { provide: ALBUM_PROVIDER, useClass: SpotifyAlbumProvider },
    { provide: GET_ALBUM, useClass: AlbumService },
    { provide: SEARCH_ALBUM, useClass: AlbumService },
  ],
})
export class AlbumModule {}
