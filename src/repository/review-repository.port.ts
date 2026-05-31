import type { PaginatedResult } from '../common/paginated-result';
import type { ReviewModel } from '../model/review.model';
import type { SubjectReference } from '../model/subject-reference';
import type { ReviewSearchCriteria } from '../model/review-search-criteria';

export interface IReviewRepository {
  save(review: ReviewModel): Promise<ReviewModel>;
  findById(id: number): Promise<ReviewModel | null>;
  findRecentByAuthorAndSubject(
    authorId: string,
    ref: SubjectReference,
    since: Date,
  ): Promise<ReviewModel | null>;
  delete(id: number): Promise<void>;
  search(criteria: ReviewSearchCriteria): Promise<PaginatedResult<ReviewModel>>;
}
