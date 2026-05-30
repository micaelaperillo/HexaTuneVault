import { Injectable, Inject } from '@nestjs/common';
import type { IGetReview } from '../port/review/get-review.port';
import type { IReviewRepository } from '../repository/review-repository.port';
import type { ReviewModel } from '../model/review.model';
import { ReviewNotFoundException } from '../error/review/review-not-found.exception';
import { REVIEW_REPOSITORY } from '../port/review/tokens';

@Injectable()
export class GetReviewService implements IGetReview {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
  ) {}

  async execute(id: number): Promise<ReviewModel> {
    const review = await this.repo.findById(id);
    if (review === null) {
      throw new ReviewNotFoundException();
    }

    return review;
  }
}
