import { Injectable, Inject } from '@nestjs/common';
import type { ISearchReview } from '@review/port/in/search-review.port.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';
import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SubjectSummary } from '@review/domain/model/subject-summary.js';
import type { SearchCriteria } from '@review/domain/model/search-criteria.js';
import { REVIEW_REPOSITORY, SUBJECT_RESOLVER } from '@review/port/tokens.js';

@Injectable()
export class SearchReviewService implements ISearchReview {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
    @Inject(SUBJECT_RESOLVER) private readonly resolver: ISubjectResolver,
  ) {}

  async execute(criteria: SearchCriteria): Promise<{
    data: { review: ReviewModel; subject: SubjectSummary }[];
    total: number;
  }> {
    const { data, total } = await this.repo.search(criteria);
    const results = await Promise.all(
      data.map(async (review) => ({
        review,
        subject: await this.resolver.resolve(review.subjectRef),
      })),
    );
    return { data: results, total };
  }
}
