/** DI token for {@link ILikeComment}. */
export const LIKE_COMMENT = Symbol('ILikeComment');

/** Use case for liking or unliking a comment. */
export interface ILikeComment {
  /**
   * Sets whether a user likes a comment. Idempotent: liking an already-liked
   * comment (or unliking one that isn't liked) leaves the state unchanged.
   *
   * @param commentId - Id of the comment to like or unlike.
   * @param userId - Id of the user performing the action.
   * @param liked - `true` to add the like, `false` to remove it.
   * @throws CommentNotFoundException If the comment does not exist.
   */
  setLike(commentId: number, userId: number, liked: boolean): Promise<void>;
}
