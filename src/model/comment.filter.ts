import type { PageableFilters } from './page.model';

export interface CommentFilters extends PageableFilters {
  createdById?: number;
  content?: string;
  parentReviewId?: number;
}
