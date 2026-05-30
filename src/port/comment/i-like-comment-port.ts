export const LIKE_COMMENT = Symbol('ILikeComment');

export interface ILikeComment {
  like(commentId: number, userId: string): Promise<void>;
}
