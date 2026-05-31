import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtistModule } from './module/artist.module';
import { PodcastModule } from './module/podcast.module';
import { AlbumModule } from './module/album.module';
import { CommentModule } from './module/comment.module';
import { UserModule } from './module/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArtistModule,
    PodcastModule,
    AlbumModule,
    CommentModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
