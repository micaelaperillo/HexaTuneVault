import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtistModule } from './module/artist.module';
import { AlbumModule } from './module/album.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArtistModule,
    AlbumModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
