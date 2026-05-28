import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from '@review/entity/review.entity.js';
import { TypeOrmReviewRepository } from '@review/adapter/out/typeorm-review.repository.js';
import { SubjectResolverAdapter } from '@review/adapter/out/subject-resolver.adapter.js';
import { CreateReviewService } from '@review/application/create-review.service.js';
import { DeleteReviewService } from '@review/application/delete-review.service.js';
import { SearchReviewService } from '@review/application/search-review.service.js';
import { GetReviewService } from '@review/application/get-review.service.js';
import { ReviewController } from '@review/adapter/in/review.controller.js';
import {
  CREATE_REVIEW,
  DELETE_REVIEW,
  SEARCH_REVIEW,
  GET_REVIEW,
  REVIEW_REPOSITORY,
  SUBJECT_RESOLVER,
  REVIEW_CONFIG,
} from '@review/port/tokens.js';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([ReviewEntity])],
  controllers: [ReviewController],
  providers: [
    { provide: REVIEW_REPOSITORY, useClass: TypeOrmReviewRepository },
    { provide: SUBJECT_RESOLVER, useClass: SubjectResolverAdapter },
    {
      provide: REVIEW_CONFIG,
      useFactory: (config: ConfigService) => ({
        cooldownSeconds: config.get<number>('REVIEW_COOLDOWN_SECONDS', 60),
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
