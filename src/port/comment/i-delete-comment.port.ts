export const DELETE_COMMENT = Symbol('IDeleteComment');

export interface IDeleteComment {
  deleteById(commentId: number): Promise<void>;
}
