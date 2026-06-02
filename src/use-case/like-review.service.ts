import { Injectable, Inject } from '@nestjs/common';
import type { ILikeReview } from '../port/review/like-review.port';
import type { IReviewRepository } from '../repository/review-repository.port';
import type { IReviewLikeRepository } from '../repository/review-like-repository.port';
import { ReviewNotFoundException } from '../error/review/review-not-found.exception';
import {
  REVIEW_REPOSITORY,
  REVIEW_LIKE_REPOSITORY,
} from '../port/review/tokens';

@Injectable()
export class LikeReviewService implements ILikeReview {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly reviews: IReviewRepository,
    @Inject(REVIEW_LIKE_REPOSITORY)
    private readonly likes: IReviewLikeRepository,
  ) {}

  async execute(reviewId: number, userId: string): Promise<void> {
    const review = await this.reviews.findById(reviewId);
    if (review === null) {
      throw new ReviewNotFoundException();
    }
    await this.likes.addLike(reviewId, userId);
  }
}
