import { CommentModel } from '../../../model/comment.model';

/** DI token for {@link IGetComment}. */
export const GET_COMMENT = Symbol('IGetComment');

/** Use case for fetching a single comment by id. */
export interface IGetComment {
  /**
   * Fetches the comment with the given id.
   *
   * @param commentId - Id of the comment to fetch.
   * @returns The matching comment.
   * @throws CommentNotFoundException If no comment exists with that id.
   */
  get(commentId: number): Promise<CommentModel>;
}
