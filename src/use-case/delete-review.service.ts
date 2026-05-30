import { Injectable, Inject } from '@nestjs/common';
import type {
  IDeleteReview,
  DeleteReviewCommand,
} from '../port/review/delete-review.port';
import type { IReviewRepository } from '../repository/review-repository.port';
import { ReviewNotFoundException } from '../error/review/review-not-found.exception';
import { ForbiddenDeletionException } from '../error/review/forbidden-deletion.exception';
import { REVIEW_REPOSITORY } from '../port/review/tokens';

@Injectable()
export class DeleteReviewService implements IDeleteReview {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
  ) {}

  async execute(cmd: DeleteReviewCommand): Promise<void> {
    const review = await this.repo.findById(cmd.reviewId);
    if (review === null) {
      throw new ReviewNotFoundException();
    }

    if (!review.isOwnedBy(cmd.requesterId)) {
      throw new ForbiddenDeletionException();
    }

    await this.repo.delete(cmd.reviewId);
  }
}
