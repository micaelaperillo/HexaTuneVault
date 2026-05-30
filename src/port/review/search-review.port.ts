import type { PaginatedResult } from '../paginated-result';
import type { ReviewModel } from '../../model/review.model';
import type { SearchCriteria } from '../../model/search-criteria';

export interface ISearchReview {
  execute(criteria: SearchCriteria): Promise<PaginatedResult<ReviewModel>>;
}
