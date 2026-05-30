import { Injectable, Inject } from '@nestjs/common';
import type {
  ICreateReview,
  CreateReviewCommand,
} from '../port/review/create-review.port';
import type { IReviewRepository } from '../repository/review-repository.port';
import type { IReviewConfig } from '../port/review/review-config.port';
import { ReviewModel } from '../model/review.model';
import { SubjectReference } from '../model/subject-reference';
import { ReviewCooldownException } from '../error/review/review-cooldown.exception';
import { REVIEW_REPOSITORY, REVIEW_CONFIG } from '../port/review/tokens';

@Injectable()
export class CreateReviewService implements ICreateReview {
  private readonly cooldownSeconds: number;

  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
    @Inject(REVIEW_CONFIG) config: IReviewConfig,
  ) {
    this.cooldownSeconds = config.cooldownSeconds;
  }

  async execute(cmd: CreateReviewCommand): Promise<ReviewModel> {
    const subjectRef = new SubjectReference(cmd.subjectType, cmd.subjectId);

    const model = ReviewModel.create({
      subjectRef,
      content: cmd.content,
      rating: cmd.rating,
      authorId: cmd.authorId,
    });

    const since = new Date(Date.now() - this.cooldownSeconds * 1000);
    const recent = await this.repo.findRecentByAuthorAndSubject(
      cmd.authorId,
      subjectRef,
      since,
    );
    if (recent) {
      throw new ReviewCooldownException();
    }

    return this.repo.save(model);
  }
}
