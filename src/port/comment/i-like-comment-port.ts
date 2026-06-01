export const LIKE_COMMENT = Symbol('ILikeComment');

export interface ILikeComment {
  setLike(commentId: number, userId: number, liked: boolean): Promise<void>;
}
