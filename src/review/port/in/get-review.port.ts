import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SubjectSummary } from '@review/domain/model/subject-summary.js';

export interface IGetReview {
  execute(
    id: number,
  ): Promise<{ review: ReviewModel; subject: SubjectSummary }>;
}
