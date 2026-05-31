import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '../entity/review.entity';
import { TypeOrmReviewRepository } from '../adapter/typeorm-review.repository';
import { CreateReviewService } from '../use-case/create-review.service';
import { DeleteReviewService } from '../use-case/delete-review.service';
import { SearchReviewService } from '../use-case/search-review.service';
import { GetReviewService } from '../use-case/get-review.service';
import { ReviewController } from '../controller/review.controller';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
  REVIEW_REPOSITORY,
  REVIEW_CONFIG,
} from '../port/review/tokens';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ReviewEntity])],
  controllers: [ReviewController],
  providers: [
    { provide: REVIEW_REPOSITORY, useClass: TypeOrmReviewRepository },
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
  ],
})
export class ReviewModule {}
