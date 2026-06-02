import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { ReviewLikeEntity } from '../entity/review-like.entity';
import { ReviewNotFoundException } from '../error/review/review-not-found.exception';
import type { IReviewLikeRepository } from '../repository/review-like-repository.port';
import { MapErrors } from '../common/map-errors.decorator';
import { reviewPersistenceFailure } from './review-error-mappings';

const FOREIGN_KEY_VIOLATION = '23503';

@Injectable()
export class TypeOrmReviewLikeRepository implements IReviewLikeRepository {
  constructor(
    @InjectRepository(ReviewLikeEntity)
    private readonly repo: Repository<ReviewLikeEntity>,
  ) {}

  @MapErrors(
    {
      from: QueryFailedError,
      when: (error) =>
        (error.driverError as { code?: string } | undefined)?.code ===
        FOREIGN_KEY_VIOLATION,
      to: () => new ReviewNotFoundException(),
    },
    reviewPersistenceFailure,
  )
  async addLike(reviewId: number, userId: string): Promise<void> {
    // ON CONFLICT DO NOTHING makes the like idempotent; a missing-review FK
    // violation is translated to a not-found by the decorator rules above.
    await this.repo
      .createQueryBuilder()
      .insert()
      .values({ reviewId, userId })
      .orIgnore()
      .execute();
  }

  @MapErrors(reviewPersistenceFailure)
  async removeLike(reviewId: number, userId: string): Promise<boolean> {
    const result = await this.repo.delete({ reviewId, userId });
    return (result.affected ?? 0) > 0;
  }
}
