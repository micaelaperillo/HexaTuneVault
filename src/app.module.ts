import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtistModule } from './module/artist.module';
import { PodcastModule } from './module/podcast.module';
import { CommentModule } from './module/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArtistModule,
    PodcastModule,
    CommentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
