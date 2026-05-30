import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/database/database.module';
import { ReviewModule } from './module/review.module';
import { ArtistModule } from './module/artist.module';
import { CommentModule } from './module/comment.module';

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
