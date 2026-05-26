import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SubjectReference } from '@review/domain/model/subject-reference.js';
import type { SearchCriteria } from '@review/domain/model/search-criteria.js';

export interface IReviewRepository {
  save(review: ReviewModel): Promise<ReviewModel>;
  findById(id: number): Promise<ReviewModel | null>;
  findByAuthorAndSubject(
    authorId: number,
    ref: SubjectReference,
  ): Promise<ReviewModel | null>;
  delete(id: number): Promise<void>;
  search(
    criteria: SearchCriteria,
  ): Promise<{ data: ReviewModel[]; total: number }>;
}
