import type { Page } from '../../../model';
import type { ReviewModel } from '../../../model/review.model';
import type { ReviewFilters } from '../../../model/review.filter';

export const SEARCH_REVIEW = Symbol('ISearchReview');

export interface ISearchReview {
  search(filters: ReviewFilters): Promise<Page<ReviewModel>>;
}
