import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, TypeORMError } from 'typeorm';
import { ReviewLikeEntity } from '../../entity/review-like.entity';
import { ReviewNotFoundException } from '../../error/review/review-not-found.exception';
import type { IReviewLikeRepository } from '../../port/out/review-like-repository.port';
import { MapErrors } from 'error-mapper-decorator';
import { ReviewRepositoryException } from './review-repository.exception';

const FOREIGN_KEY_VIOLATION = '23503';

const hasStringCode = (value: unknown): value is { code: string } =>
  typeof value === 'object' &&
  value !== null &&
  'code' in value &&
  typeof value.code === 'string';

const driverCode = (error: QueryFailedError): string | undefined => {
  const driver: unknown = error.driverError;
  return hasStringCode(driver) ? driver.code : undefined;
};

@Injectable()
@MapErrors({
  from: TypeORMError,
  to: (error) => new ReviewRepositoryException(error.message),
})
export class ReviewLikeRepository implements IReviewLikeRepository {
  constructor(
    @InjectRepository(ReviewLikeEntity)
    private readonly repo: Repository<ReviewLikeEntity>,
  ) {}

  @MapErrors({
    from: QueryFailedError,
    when: (error) => driverCode(error) === FOREIGN_KEY_VIOLATION,
    to: () => new ReviewNotFoundException(),
  })
  async addLike(reviewId: number, userId: number): Promise<void> {
    // Idempotent: a duplicate (PK) like is silently ignored. A missing-review FK
    // violation maps to not-found; any other TypeORM failure falls through to
    // the class-level repository-exception rule.
    await this.repo
      .createQueryBuilder()
      .insert()
      .values({ reviewId, userId })
      .orIgnore()
      .execute();
  }

  async removeLike(reviewId: number, userId: number): Promise<void> {
    await this.repo.delete({ reviewId, userId });
  }

  async countLikes(reviewId: number): Promise<number> {
    return this.repo.count({ where: { reviewId } });
  }

  async hasLike(reviewId: number, userId: number): Promise<boolean> {
    return (await this.repo.count({ where: { reviewId, userId } })) > 0;
  }
}
