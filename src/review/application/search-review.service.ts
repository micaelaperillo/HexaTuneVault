import { Injectable, Inject } from '@nestjs/common';
import type { ISearchReview } from '@review/port/in/search-review.port.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { ISubjectResolver } from '@review/port/out/subject-resolver.port.js';
import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SubjectSummary } from '@review/domain/model/subject-summary.js';
import type { SearchCriteria } from '@review/domain/model/search-criteria.js';
import type { SubjectReference } from '@review/domain/model/subject-reference.js';
import { SubjectNotFoundException } from '@review/domain/exception/subject-not-found.exception.js';
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

    const uniqueRefs = new Map<string, SubjectReference>();
    for (const review of data) {
      uniqueRefs.set(review.subjectRef.key(), review.subjectRef);
    }

    const resolved = new Map<string, SubjectSummary>();
    await Promise.all(
      [...uniqueRefs.entries()].map(async ([key, ref]) => {
        resolved.set(key, await this.resolver.resolve(ref));
      }),
    );

    const results = data.map((review) => {
      const subject = resolved.get(review.subjectRef.key());
      if (!subject) {
        throw new SubjectNotFoundException();
      }
      return { review, subject };
    });

    return { data: results, total };
  }
}
