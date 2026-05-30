import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '@entity/review.entity.js';
import { TypeOrmReviewRepository } from '@adapter/typeorm-review.repository.js';
import { CreateReviewService } from '@use-case/create-review.service.js';
import { DeleteReviewService } from '@use-case/delete-review.service.js';
import { SearchReviewService } from '@use-case/search-review.service.js';
import { GetReviewService } from '@use-case/get-review.service.js';
import { ReviewController } from '@controller/review.controller.js';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
  REVIEW_REPOSITORY,
  REVIEW_CONFIG,
} from '@port/review/tokens.js';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ReviewEntity])],
  controllers: [ReviewController],
  providers: [
    { provide: REVIEW_REPOSITORY, useClass: TypeOrmReviewRepository },
    {
      provide: REVIEW_CONFIG,
      useFactory: (config: ConfigService) => ({
        cooldownSeconds: Number(
          config.get<string>('REVIEW_COOLDOWN_SECONDS', '60'),
        ),
      }),
      inject: [ConfigService],
    },
    { provide: CREATE_REVIEW, useClass: CreateReviewService },
    { provide: DELETE_REVIEW, useClass: DeleteReviewService },
    { provide: SEARCH_REVIEW, useClass: SearchReviewService },
    { provide: GET_REVIEW, useClass: GetReviewService },
  ],
})
export class ReviewModule {}
