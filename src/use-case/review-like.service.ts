import { Injectable, Inject } from '@nestjs/common';
import type { ILikeReview } from '../port/review/like-review.port';
import type { IUnlikeReview } from '../port/review/unlike-review.port';
import type { ICountReviewLikes } from '../port/review/count-review-likes.port';
import type { IReviewRepository } from '../repository/review-repository.port';
import type { IReviewLikeRepository } from '../repository/review-like-repository.port';
import { ReviewNotFoundException } from '../error/review/review-not-found.exception';
import { NotLikedException } from '../error/review/not-liked.exception';
import {
  REVIEW_REPOSITORY,
  REVIEW_LIKE_REPOSITORY,
} from '../port/review/tokens';

@Injectable()
export class ReviewLikeService
  implements ILikeReview, IUnlikeReview, ICountReviewLikes
{
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly reviews: IReviewRepository,
    @Inject(REVIEW_LIKE_REPOSITORY)
    private readonly likes: IReviewLikeRepository,
  ) {}

  async like(reviewId: number, userId: string): Promise<void> {
    await this.ensureReviewExists(reviewId);
    await this.likes.addLike(reviewId, userId);
  }

  async unlike(reviewId: number, userId: string): Promise<void> {
    await this.ensureReviewExists(reviewId);
    const removed = await this.likes.removeLike(reviewId, userId);
    if (!removed) {
      throw new NotLikedException();
    }
  }

  async count(reviewId: number): Promise<number> {
    await this.ensureReviewExists(reviewId);
    return this.likes.countLikes(reviewId);
  }

  private async ensureReviewExists(reviewId: number): Promise<void> {
    const review = await this.reviews.findById(reviewId);
    if (review === null) {
      throw new ReviewNotFoundException();
    }
  }
}
