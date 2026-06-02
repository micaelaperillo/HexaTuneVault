import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../entity/review.entity';
import { ReviewLikeEntity } from '../entity/review-like.entity';
import { TypeOrmReviewRepository } from '../adapter/typeorm-review.repository';
import { TypeOrmReviewLikeRepository } from '../adapter/typeorm-review-like.repository';
import { CreateReviewService } from '../use-case/create-review.service';
import { DeleteReviewService } from '../use-case/delete-review.service';
import { SearchReviewService } from '../use-case/search-review.service';
import { GetReviewService } from '../use-case/get-review.service';
import { LikeReviewService } from '../use-case/like-review.service';
import { UnlikeReviewService } from '../use-case/unlike-review.service';
import { ReviewController } from '../controller/review.controller';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
  LIKE_REVIEW,
  UNLIKE_REVIEW,
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
    { provide: CREATE_REVIEW, useClass: CreateReviewService },
    { provide: DELETE_REVIEW, useClass: DeleteReviewService },
    { provide: SEARCH_REVIEW, useClass: SearchReviewService },
    { provide: GET_REVIEW, useClass: GetReviewService },
    { provide: LIKE_REVIEW, useClass: LikeReviewService },
    { provide: UNLIKE_REVIEW, useClass: UnlikeReviewService },
  ],
})
export class ReviewModule {}
