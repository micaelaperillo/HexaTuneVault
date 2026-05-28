import { Module } from '@nestjs/common';
import { SpotifyArtistProvider } from './adapter';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';

@Module({
  imports: [],
  controllers: [ArtistController],
  providers: [
    { provide: 'IArtistProvider', useClass: SpotifyArtistProvider },
    ArtistService,
  ],
})
export class ArtistModule {}
