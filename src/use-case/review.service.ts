import { Injectable, Inject } from '@nestjs/common';
import type {
  ICreateReview,
  CreateReviewCommand,
} from '../port/review/create-review.port';
import type {
  IDeleteReview,
  DeleteReviewCommand,
} from '../port/review/delete-review.port';
import type { IGetReview } from '../port/review/get-review.port';
import type { ISearchReview } from '../port/review/search-review.port';
import type { ILikeReview } from '../port/review/like-review.port';
import type { IUnlikeReview } from '../port/review/unlike-review.port';
import type { ICountReviewLikes } from '../port/review/count-review-likes.port';
import type { IHasLikedReview } from '../port/review/has-liked-review.port';
import {
  REVIEW_REPOSITORY,
  type IReviewRepository,
} from '../repository/review-repository.port';
import {
  REVIEW_LIKE_REPOSITORY,
  type IReviewLikeRepository,
} from '../repository/review-like-repository.port';
import {
  REVIEW_CONFIG,
  type IReviewConfig,
} from '../port/review/review-config.port';
import type { Page } from '../model';
import type { ReviewModel } from '../model/review.model';
import type { ReviewFilters } from '../model/review.filter';
import { ReviewCooldownException } from '../error/review/review-cooldown.exception';
import { ReviewNotFoundException } from '../error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../error/review/forbidden-deletion.exception';

@Injectable()
export class ReviewService
  implements
    ICreateReview,
    IDeleteReview,
    IGetReview,
    ISearchReview,
    ILikeReview,
    IUnlikeReview,
    ICountReviewLikes,
    IHasLikedReview
{
  private readonly cooldownSeconds: number;

  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly reviews: IReviewRepository,
    @Inject(REVIEW_LIKE_REPOSITORY)
    private readonly likes: IReviewLikeRepository,
    @Inject(REVIEW_CONFIG) config: IReviewConfig,
  ) {
    this.cooldownSeconds = config.cooldownSeconds;
  }

  async create(cmd: CreateReviewCommand): Promise<ReviewModel> {
    const since = new Date(Date.now() - this.cooldownSeconds * 1000);
    const recent = await this.reviews.findRecentByAuthorAndSubject(
      cmd.author,
      cmd.subject,
      since,
    );
    if (recent) {
      throw new ReviewCooldownException();
    }

    return this.reviews.create(cmd);
  }

  async delete(cmd: DeleteReviewCommand): Promise<void> {
    const review = await this.reviews.findById(cmd.reviewId);
    if (review === null) {
      throw new ReviewNotFoundException();
    }

    if (review.author.id !== cmd.requesterId.id) {
      throw new ForbiddenDeletionException();
    }

    await this.reviews.delete(cmd.reviewId);
  }

  async get(id: number): Promise<ReviewModel> {
    const review = await this.reviews.findById(id);
    if (review === null) {
      throw new ReviewNotFoundException();
    }
    return review;
  }

  async search(filters: ReviewFilters): Promise<Page<ReviewModel>> {
    return this.reviews.search(filters);
  }

  async like(reviewId: number, userId: number): Promise<void> {
    // Idempotent. A missing review surfaces as ReviewNotFoundException via the
    // repository's foreign-key mapping, so no separate existence check is needed.
    await this.likes.addLike(reviewId, userId);
  }

  async unlike(reviewId: number, userId: number): Promise<void> {
    await this.ensureReviewExists(reviewId);
    await this.likes.removeLike(reviewId, userId);
  }

  async count(reviewId: number): Promise<number> {
    await this.ensureReviewExists(reviewId);
    return this.likes.countLikes(reviewId);
  }

  async hasLiked(reviewId: number, userId: number): Promise<boolean> {
    return this.likes.hasLike(reviewId, userId);
  }

  private async ensureReviewExists(reviewId: number): Promise<void> {
    const review = await this.reviews.findById(reviewId);
    if (review === null) {
      throw new ReviewNotFoundException();
    }
  }
}
