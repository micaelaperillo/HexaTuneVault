import type { Page } from '../../model';
import type { ReviewModel } from '../../model/review.model';
import type { ReviewSearchCriteria } from '../../model/review-search-criteria';

export interface ISearchReview {
  execute(criteria: ReviewSearchCriteria): Promise<Page<ReviewModel>>;
}
