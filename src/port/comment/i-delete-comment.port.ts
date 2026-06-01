/** DI token for {@link IDeleteComment}. */
export const DELETE_COMMENT = Symbol('IDeleteComment');

/** Use case for deleting a comment. */
export interface IDeleteComment {
  /**
   * Deletes the comment with the given id. Replies are removed via the
   * `ON DELETE CASCADE` on the self-referential parent relation.
   *
   * Idempotent: deleting a non-existent id is a no-op and does not throw.
   *
   * @param commentId - Id of the comment to delete.
   */
  deleteById(commentId: number): Promise<void>;
}
