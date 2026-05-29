import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtistModule } from './module/artist.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ArtistModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
