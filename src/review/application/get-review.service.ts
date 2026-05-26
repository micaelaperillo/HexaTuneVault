import { Injectable, Inject } from '@nestjs/common';
import type { IGetReview } from '@review/port/in/get-review.port.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';
import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SubjectSummary } from '@review/domain/model/subject-summary.js';
import { ReviewNotFoundException } from '@review/domain/exception/review-not-found.exception.js';
import { REVIEW_REPOSITORY, SUBJECT_RESOLVER } from '@review/port/tokens.js';

@Injectable()
export class GetReviewService implements IGetReview {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
    @Inject(SUBJECT_RESOLVER) private readonly resolver: ISubjectResolver,
  ) {}

  async execute(
    id: number,
  ): Promise<{ review: ReviewModel; subject: SubjectSummary }> {
    const review = await this.repo.findById(id);
    if (review === null) {
      throw new ReviewNotFoundException();
    }

    const subject = await this.resolver.resolve(review.subjectRef);

    return { review, subject };
  }
}
