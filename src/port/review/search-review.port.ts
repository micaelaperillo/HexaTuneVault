import type { PaginatedResult } from '../../common/paginated-result';
import type { ReviewModel } from '../../model/review.model';
import type { ReviewSearchCriteria } from '../../model/review-search-criteria';

export const SEARCH_REVIEW = Symbol('ISearchReview');

export interface ISearchReview {
  search(criteria: ReviewSearchCriteria): Promise<PaginatedResult<ReviewModel>>;
}
