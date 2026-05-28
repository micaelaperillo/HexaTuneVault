import { Injectable, Inject } from '@nestjs/common';
import type { IGetReview } from '@review/port/in/get-review.port.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ReviewModel } from '@review/domain/model/review.model.js';
import { ReviewNotFoundException } from '@review/domain/exception/review-not-found.exception.js';
import { REVIEW_REPOSITORY } from '@review/port/tokens.js';

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
