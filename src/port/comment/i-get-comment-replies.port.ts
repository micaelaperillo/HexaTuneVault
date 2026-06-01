import { CommentModel } from '../../model/comment.model';

/** DI token for {@link IGetCommentReplies}. */
export const GET_COMMENT_REPLIES = Symbol('IGetCommentReplies');

/** Use case for fetching the direct replies of a comment. */
export interface IGetCommentReplies {
  /**
   * Returns the direct replies (children) of the given comment. Only one level
   * deep — replies of replies are not included.
   *
   * @param commentId - Id of the parent comment.
   * @returns The direct replies (empty array if the comment has none).
   * @throws CommentNotFoundException If the parent comment does not exist.
   */
  getReplies(commentId: number): Promise<CommentModel[]>;
}
