import type { PaginatedResult } from '@review/port/paginated-result.js';
import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SearchCriteria } from '@review/port/search-criteria.js';

export interface ISearchReview {
  execute(criteria: SearchCriteria): Promise<PaginatedResult<ReviewModel>>;
}
