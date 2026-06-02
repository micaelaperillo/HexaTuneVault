import type { PageableFilters } from '../page.model';

export type CommentFilters = PageableFilters & {
  createdById?: number;
  content?: string;
  parentReviewId?: number;
};
