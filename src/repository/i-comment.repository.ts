import type { CommentFilters } from '../model/comment.filter';
import type { CommentModel } from '../model';

/** DI token for {@link ICommentRepository}. */
export const COMMENT_REPOSITORY = Symbol('ICommentRepository');

/**
 * Persistence contract for comments.
 *
 * Unlike the use-case ports, the repository is "absence-tolerant": lookups
 * return `null`/empty rather than throwing, leaving the domain decision of
 * whether a missing comment is an error to the service layer. Underlying
 * database failures are surfaced as `CommentDBException`.
 */
export interface ICommentRepository {
  /**
   * Persists a new comment and returns it reloaded from the database
   * (so generated columns such as `id` and `createdAt` are populated).
   *
   * @param comment - The comment to create, without server-assigned fields.
   * @throws CommentDBException On a database error (e.g. a violated foreign key
   * when the author or parent review does not exist).
   */
  create(comment: Omit<CommentModel, 'id' | 'createdAt'>): Promise<CommentModel>;

  /**
   * Looks up a comment by id.
   *
   * @returns The comment, or `null` if none exists with that id.
   */
  findById(id: number): Promise<CommentModel | null>;

  /**
   * Returns top-level comments (those without a parent comment) matching the
   * given filters. Replies are never included.
   */
  search(filters: CommentFilters): Promise<CommentModel[]>;

  /**
   * Returns the direct replies (children) of the given comment.
   *
   * @returns The replies, or an empty array if there are none. Does not
   * distinguish a non-existent parent from a parent with no replies.
   */
  findReplies(parentCommentId: number): Promise<CommentModel[]>;

  /**
   * Returns the ids of users who liked the comment.
   *
   * @returns The liking users' ids, or `null` if the comment does not exist.
   * The `null` vs. `[]` distinction lets the service tell "no such comment"
   * apart from "comment with zero likes".
   */
  findLikesByCommentId(commentId: number): Promise<number[] | null>;

  /**
   * Deletes the comment by id (cascading to its replies). A no-op if the id
   * does not exist.
   *
   * @throws CommentDBException On a database error.
   */
  deleteById(id: number): Promise<void>;

  /**
   * Adds a like from `userId` to the comment. Idempotent: does nothing if the
   * user has already liked it.
   */
  addLike(commentId: number, userId: number): Promise<void>;

  /**
   * Removes `userId`'s like from the comment. A no-op if the like is absent.
   */
  removeLike(commentId: number, userId: number): Promise<void>;
}
