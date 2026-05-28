import { Module } from '@nestjs/common';
import { SpotifyArtistProvider } from '../adapter';
import { ArtistService } from '../use-case/artist.service';
import { ArtistController } from '../controller/artist.controller';
import { ExternalApiModule } from 'src/infrastructure/api/api.module';

@Module({
  imports: [ExternalApiModule],
  controllers: [ArtistController],
  providers: [
    { provide: 'IArtistProvider', useClass: SpotifyArtistProvider },
    ArtistService,
  ],
})
export class ArtistModule {}
