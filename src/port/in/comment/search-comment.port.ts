import { CommentModel, CommentFilters } from '../../../model/comment';
import type { Page } from '../../../model';

/** DI token for {@link ISearchComment}. */
export const SEARCH_COMMENT = Symbol('ISearchComment');

/** Use case for searching top-level comments. */
export interface ISearchComment {
  /**
   * Returns top-level comments (replies are excluded) matching the given filters.
   * Use {@link IGetCommentReplies} to fetch the replies of a specific comment.
   *
   * @param filters - Optional criteria, including pagination.
   * @returns A page of matching top-level comments.
   */
  search(filters: CommentFilters): Promise<Page<CommentModel>>;
}
