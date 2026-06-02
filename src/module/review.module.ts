import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../entity/review.entity';
import { ReviewLikeEntity } from '../entity/review-like.entity';
import { TypeOrmReviewRepository } from '../adapter/typeorm-review.repository';
import { TypeOrmReviewLikeRepository } from '../adapter/typeorm-review-like.repository';
import { ReviewService } from '../use-case/review.service';
import { ReviewController } from '../controller/review.controller';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
  LIKE_REVIEW,
  UNLIKE_REVIEW,
  COUNT_REVIEW_LIKES,
  REVIEW_REPOSITORY,
  REVIEW_LIKE_REPOSITORY,
  REVIEW_CONFIG,
} from '../port/review/tokens';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ReviewEntity, ReviewLikeEntity]),
  ],
  controllers: [ReviewController],
  providers: [
    { provide: REVIEW_REPOSITORY, useClass: TypeOrmReviewRepository },
    {
      provide: REVIEW_LIKE_REPOSITORY,
      useClass: TypeOrmReviewLikeRepository,
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
  ],
})
export class ReviewModule {}
