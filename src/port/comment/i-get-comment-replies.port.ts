import { CommentModel } from '../../model/comment.model';

export const GET_COMMENT_REPLIES = Symbol('IGetCommentReplies');

export interface IGetCommentReplies {
  getReplies(commentId: number): Promise<CommentModel[]>;
}
