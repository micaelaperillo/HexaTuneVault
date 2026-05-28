import { Injectable, Inject } from '@nestjs/common';
import type {
  ICreateReview,
  CreateReviewCommand,
} from '@review/port/in/create-review.port.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';
import type { IReviewConfig } from '@review/port/out/review-config.port.js';
import type { SubjectSummary } from '@review/domain/model/subject-summary.js';
import { ReviewModel } from '@review/domain/model/review.model.js';
import { SubjectReference } from '@review/domain/model/subject-reference.js';
import { ReviewCooldownException } from '@review/domain/exception/review-cooldown.exception.js';
import {
  REVIEW_REPOSITORY,
  SUBJECT_RESOLVER,
  REVIEW_CONFIG,
} from '@review/port/tokens.js';

@Injectable()
export class CreateReviewService implements ICreateReview {
  private readonly cooldownSeconds: number;

  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
    @Inject(SUBJECT_RESOLVER) private readonly resolver: ISubjectResolver,
    @Inject(REVIEW_CONFIG) config: IReviewConfig,
  ) {
    this.cooldownSeconds = config.cooldownSeconds;
  }

  async execute(
    cmd: CreateReviewCommand,
  ): Promise<{ review: ReviewModel; subject: SubjectSummary }> {
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

    const subject = await this.resolver.resolve(subjectRef);
    const review = await this.repo.save(model);

    return { review, subject };
  }
}
