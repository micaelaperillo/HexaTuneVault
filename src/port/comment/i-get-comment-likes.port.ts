export const GET_COMMENT_LIKES = Symbol('IGetCommentLikes');

export interface IGetCommentLikes {
  getLikes(commentId: number): Promise<string[]>;
}
