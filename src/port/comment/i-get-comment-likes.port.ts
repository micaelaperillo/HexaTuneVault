import type { UserModel } from '../../model';

/** DI token for {@link IGetCommentLikes}. */
export const GET_COMMENT_LIKES = Symbol('IGetCommentLikes');

/** Use case for listing the users who liked a comment. */
export interface IGetCommentLikes {
  /**
   * Returns the ids of the users who liked the given comment.
   *
   * @param commentId - Id of the comment.
   * @returns The liking users (empty array if the comment has no likes).
   * @throws CommentNotFoundException If the comment does not exist.
   */
  getLikes(commentId: number): Promise<UserModel[]>;
}
