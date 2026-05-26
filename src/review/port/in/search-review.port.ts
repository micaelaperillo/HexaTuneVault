import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SubjectSummary } from '@review/domain/model/subject-summary.js';
import type { SearchCriteria } from '@review/domain/model/search-criteria.js';

export interface ISearchReview {
  execute(criteria: SearchCriteria): Promise<{
    data: { review: ReviewModel; subject: SubjectSummary }[];
    total: number;
  }>;
}
