import { CommentModel } from '../../model/comment.model';
import { CommentFilters } from '../../model/comment.filter';

/** DI token for {@link ISearchComment}. */
export const SEARCH_COMMENT = Symbol('ISearchComment');

/** Use case for searching top-level comments. */
export interface ISearchComment {
  /**
   * Returns top-level comments (replies are excluded) matching the given filters.
   * Use {@link IGetCommentReplies} to fetch the replies of a specific comment.
   *
   * @param filters - Optional criteria; any unset field is not constrained.
   * @returns The matching top-level comments (empty array if none match).
   */
  search(filters: CommentFilters): Promise<CommentModel[]>;
}
