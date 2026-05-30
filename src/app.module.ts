import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@infrastructure/database/database.module.js';
import { ReviewModule } from './module/review.module.js';
import { ArtistModule } from './module/artist.module.js';
import { CommentModule } from './module/comment.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ReviewModule,
    ArtistModule,
    CommentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
