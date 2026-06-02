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
import type { Page, UserModel } from '../model';
import type { ReviewSearchCriteria } from '../model/review-search-criteria';
import { ReviewModel } from '../model/review.model';
import { SubjectReference } from '../model/subject-reference';
import { ReviewCooldownException } from '../error/review/review-cooldown.exception';
import { ReviewNotFoundException } from '../error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../error/review/forbidden-deletion.exception';
import { NotLikedException } from '../error/review/not-liked.exception';

@Injectable()
export class ReviewService
  implements
    ICreateReview,
    IDeleteReview,
    IGetReview,
    ISearchReview,
    ILikeReview,
    IUnlikeReview,
    ICountReviewLikes
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
    const subjectRef = new SubjectReference(cmd.subjectType, cmd.subjectId);

    const model = ReviewModel.create({
      subjectRef,
      content: cmd.content,
      rating: cmd.rating,
      author: cmd.author as UserModel,
    });

    const since = new Date(Date.now() - this.cooldownSeconds * 1000);
    const recent = await this.reviews.findRecentByAuthorAndSubject(
      cmd.author,
      subjectRef,
      since,
    );
    if (recent) {
      throw new ReviewCooldownException();
    }

    return this.reviews.save(model);
  }

  async delete(cmd: DeleteReviewCommand): Promise<void> {
    const review = await this.reviews.findById(cmd.reviewId);
    if (review === null) {
      throw new ReviewNotFoundException();
    }

    if (!review.isOwnedBy(cmd.requesterId)) {
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

  async search(criteria: ReviewSearchCriteria): Promise<Page<ReviewModel>> {
    return this.reviews.search(criteria);
  }

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
