export const UNLIKE_COMMENT = Symbol('IUnlikeComment');

export interface IUnlikeComment {
  unlike(commentId: number, userId: string): Promise<void>;
}
