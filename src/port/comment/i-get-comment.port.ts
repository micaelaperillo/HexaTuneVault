import { CommentModel } from '../../model/comment.model';

export const GET_COMMENT = Symbol('IGetComment');

export interface IGetComment {
  get(commentId: number): Promise<CommentModel>;
}
