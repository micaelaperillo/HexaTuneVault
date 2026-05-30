import type { PaginatedResult } from '@port/paginated-result.js';
import type { ReviewModel } from '@model/review.model.js';
import type { SearchCriteria } from '@model/search-criteria.js';

export interface ISearchReview {
  execute(criteria: SearchCriteria): Promise<PaginatedResult<ReviewModel>>;
}
