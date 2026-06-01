import { CommentModel, UserModel, ReviewModel } from '../../model';

/** DI token for {@link ICreateComment}. */
export const CREATE_COMMENT = Symbol('ICreateComment');

/** Use case for creating a new comment on a review (or as a reply to another comment). */
export interface ICreateComment {
  /**
   * Persists a new comment.
   *
   * @param comment - The comment to create. `id` and `createdAt` are assigned by
   * the persistence layer, so they are omitted from the input. Set `parentCommentId`
   * to nest the comment as a reply, or `null` for a top-level comment.
   * @returns The created comment, including its generated `id` and `createdAt`.
   */
  create(
    comment: Omit<
      CommentModel,
      'id' | 'createdAt' | 'createdBy' | 'parentReview'
    > & {
      createdBy: Pick<UserModel, 'id'>;
      parentReview: Pick<ReviewModel, 'id'>;
    },
  ): Promise<CommentModel>;
}
