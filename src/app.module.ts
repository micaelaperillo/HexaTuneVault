import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArtistModule } from './module/artist.module';
import { CommentModule } from './module/comment.module';
import { UserModule } from './module/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ArtistModule,
    CommentModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
