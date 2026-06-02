import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { ReviewLikeEntity } from '../entity/review-like.entity';
import { ReviewNotFoundException } from '../error/review/review-not-found.exception';
import { AlreadyLikedException } from '../error/review/already-liked.exception';
import type { IReviewLikeRepository } from '../repository/review-like-repository.port';
import { MapErrors } from 'error-mapper-decorator';
import { reviewPersistenceFailure } from './review-error-mappings';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

const driverCode = (error: QueryFailedError): string | undefined =>
  (error.driverError as { code?: string } | undefined)?.code;

@Injectable()
export class ReviewLikeRepository implements IReviewLikeRepository {
  constructor(
    @InjectRepository(ReviewLikeEntity)
    private readonly repo: Repository<ReviewLikeEntity>,
  ) {}

  @MapErrors(
    {
      from: QueryFailedError,
      when: (error) => driverCode(error) === UNIQUE_VIOLATION,
      to: () => new AlreadyLikedException(),
    },
    {
      from: QueryFailedError,
      when: (error) => driverCode(error) === FOREIGN_KEY_VIOLATION,
      to: () => new ReviewNotFoundException(),
    },
    reviewPersistenceFailure,
  )
  async addLike(reviewId: number, userId: number): Promise<void> {
    // Duplicate (PK) -> AlreadyLiked, missing-review FK -> not-found, both via
    // the decorator rules above.
    await this.repo
      .createQueryBuilder()
      .insert()
      .values({ reviewId, userId })
      .execute();
  }

  @MapErrors(reviewPersistenceFailure)
  async removeLike(reviewId: number, userId: number): Promise<boolean> {
    const result = await this.repo.delete({ reviewId, userId });
    return (result.affected ?? 0) > 0;
  }

  @MapErrors(reviewPersistenceFailure)
  async countLikes(reviewId: number): Promise<number> {
    return this.repo.count({ where: { reviewId } });
  }
}
