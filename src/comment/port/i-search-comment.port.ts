import { CommentModel } from '../model/comment.model';
import { CommentFilters } from '../model/comment-filters.model';

export const SEARCH_COMMENT = Symbol('ISearchComment');

export interface ISearchComment {
  search(filters: CommentFilters): Promise<CommentModel[]>;
}
