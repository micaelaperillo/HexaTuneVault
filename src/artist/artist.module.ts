import { Module } from '@nestjs/common';
import { SpotifyArtistProvider, PostgresArtistRepository } from './adapter';
import { ArtistService } from './artist.service';
import { ArtistController } from './artist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArtistEntity } from './entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArtistEntity])],
  controllers: [ArtistController],
  providers: [
    { provide: 'IArtistRepository', useClass: PostgresArtistRepository },
    { provide: 'IArtistProvider', useClass: SpotifyArtistProvider },
    ArtistService,
  ],
})
export class ArtistModule {}
