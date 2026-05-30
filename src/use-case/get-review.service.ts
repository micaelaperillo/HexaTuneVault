import { Injectable, Inject } from '@nestjs/common';
import type { IGetReview } from '@port/review/get-review.port.js';
import type { IReviewRepository } from '@repository/review-repository.port.js';
import type { ReviewModel } from '@model/review.model.js';
import { ReviewNotFoundException } from '@error/review/review-not-found.exception.js';
import { REVIEW_REPOSITORY } from '@port/review/tokens.js';

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
