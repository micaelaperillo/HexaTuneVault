import {
  Logger,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './infrastructure/database/database.module';
import { ReviewModule } from './module/review.module';
import { ArtistModule } from './module/artist.module';
import { PodcastModule } from './module/podcast.module';
import { AlbumModule } from './module/album.module';
import { CommentModule } from './module/comment.module';
import { UserModule } from './module/user.module';
import { ImageModule } from './module/image.module';

import type { Request, Response, NextFunction } from 'express';

export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, _res: Response, next: NextFunction) {
    this.logger.debug(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ReviewModule,
    ArtistModule,
    PodcastModule,
    AlbumModule,
    CommentModule,
    UserModule,
    ImageModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('api/*');
  }
}
