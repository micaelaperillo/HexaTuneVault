/** DI token for {@link IHasLikedComment}. */
export const HAS_LIKED_COMMENT = Symbol('IHasLikedComment');

/** Use case for checking whether a user has liked a comment. */
export interface IHasLikedComment {
  /**
   * Reports whether the given user has liked the given comment. Absence-tolerant:
   * returns `false` for a non-existent comment rather than distinguishing it.
   *
   * @param commentId - Id of the comment.
   * @param userId - Id of the user.
   * @returns `true` if the user has liked the comment, `false` otherwise.
   */
  hasLiked(commentId: number, userId: number): Promise<boolean>;
}
