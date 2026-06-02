import { Module } from '@nestjs/common';

import { ArtistController } from '../adapter/in/http/artist.controller';
import { ExternalApiModule } from '../infrastructure/api/api.module';

import { SpotifyArtistProvider } from '../adapter/out';
import { ARTIST_PROVIDER } from '../port/out';

import {
  ArtistService,
  GET_ARTIST,
  SEARCH_ARTIST,
} from '../use-case/artist.service';

@Module({
  imports: [ExternalApiModule],
  controllers: [ArtistController],
  providers: [
    { provide: ARTIST_PROVIDER, useClass: SpotifyArtistProvider },
    { provide: GET_ARTIST, useClass: ArtistService },
    { provide: SEARCH_ARTIST, useClass: ArtistService },
  ],
})
export class ArtistModule {}
