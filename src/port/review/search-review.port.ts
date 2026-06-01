import type { PaginatedResult } from '../../common/paginated-result';
import type { ReviewModel } from '../../model/review.model';
import type { ReviewSearchCriteria } from '../../model/review-search-criteria';

export interface ISearchReview {
  execute(
    criteria: ReviewSearchCriteria,
  ): Promise<PaginatedResult<ReviewModel>>;
}
