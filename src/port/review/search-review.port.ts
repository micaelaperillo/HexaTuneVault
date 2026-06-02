import type { Page } from '../../model';
import type { ReviewModel } from '../../model/review.model';
import type { ReviewSearchCriteria } from '../../model/review-search-criteria';

export const SEARCH_REVIEW = Symbol('ISearchReview');

export interface ISearchReview {
  search(criteria: ReviewSearchCriteria): Promise<Page<ReviewModel>>;
}
