import type { Page } from '../../../model';
import type { ReviewModel, ReviewFilters } from '../../../model/review';

export const SEARCH_REVIEW = Symbol('ISearchReview');

export interface ISearchReview {
  search(filters: ReviewFilters): Promise<Page<ReviewModel>>;
}
