import type { CommentFilters } from '../model/comment.filter';
import type { CommentModel } from '../model';

export const COMMENT_REPOSITORY = Symbol('ICommentRepository');

export interface ICommentRepository {
  create(
    comment: Omit<CommentModel, 'id' | 'createdAt'>,
  ): Promise<CommentModel>;
  findById(id: number): Promise<CommentModel | null>;
  search(filters: CommentFilters): Promise<CommentModel[]>;
  findReplies(parentCommentId: number): Promise<CommentModel[]>;
  findLikesByCommentId(commentId: number): Promise<number[] | null>;
  deleteById(id: number): Promise<void>;
  addLike(commentId: number, userId: number): Promise<void>;
  removeLike(commentId: number, userId: number): Promise<void>;
}
