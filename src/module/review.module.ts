import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../adapter/out/persistence/entity/review.entity';
import { ReviewLikeEntity } from '../adapter/out/persistence/entity/review-like.entity';
import { ReviewRepository } from '../adapter/out/persistence/review.repository';
import { ReviewLikeRepository } from '../adapter/out/persistence/review-like.repository';
import { ReviewService } from '../use-case/review.service';
import { ReviewController } from '../adapter/in/http/review.controller';
import { CREATE_REVIEW } from '../port/in/review/create-review.port';
import { DELETE_REVIEW } from '../port/in/review/delete-review.port';
import { SEARCH_REVIEW } from '../port/in/review/search-review.port';
import { GET_REVIEW } from '../port/in/review/get-review.port';
import { LIKE_REVIEW } from '../port/in/review/like-review.port';
import { UNLIKE_REVIEW } from '../port/in/review/unlike-review.port';
import { COUNT_REVIEW_LIKES } from '../port/in/review/count-review-likes.port';
import { HAS_LIKED_REVIEW } from '../port/in/review/has-liked-review.port';
import { REVIEW_CONFIG } from '../port/in/review/review-config.port';
import { REVIEW_REPOSITORY, REVIEW_LIKE_REPOSITORY } from '../port/out';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ReviewEntity, ReviewLikeEntity]),
  ],
  controllers: [ReviewController],
  providers: [
    { provide: REVIEW_REPOSITORY, useClass: ReviewRepository },
    {
      provide: REVIEW_LIKE_REPOSITORY,
      useClass: ReviewLikeRepository,
    },
    {
      provide: REVIEW_CONFIG,
      useFactory: (config: ConfigService) => ({
        cooldownSeconds:
          parseInt(config.get<string>('REVIEW_COOLDOWN_SECONDS', '60'), 10) ||
          60,
      }),
      inject: [ConfigService],
    },
    ReviewService,
    { provide: CREATE_REVIEW, useExisting: ReviewService },
    { provide: DELETE_REVIEW, useExisting: ReviewService },
    { provide: SEARCH_REVIEW, useExisting: ReviewService },
    { provide: GET_REVIEW, useExisting: ReviewService },
    { provide: LIKE_REVIEW, useExisting: ReviewService },
    { provide: UNLIKE_REVIEW, useExisting: ReviewService },
    { provide: COUNT_REVIEW_LIKES, useExisting: ReviewService },
    { provide: HAS_LIKED_REVIEW, useExisting: ReviewService },
  ],
})
export class ReviewModule {}
