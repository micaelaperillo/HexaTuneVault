import type { AssociatedType } from '../model/comment.associated.type';
import type { CommentFilters } from '../model/comment.filter';
import type { CommentModel } from '../model';

export const COMMENT_REPOSITORY = Symbol('ICommentRepository');

export interface ICommentRepository {
  create(
    comment: Omit<CommentModel, 'id' | 'createdAt' | 'likedBy'>,
  ): Promise<CommentModel>;
  findById(id: number): Promise<CommentModel | null>;
  search(filters: CommentFilters): Promise<CommentModel[]>;
  findByAssociatedId(
    associatedId: string,
    associatedType: AssociatedType,
  ): Promise<CommentModel[]>;
  findLikesByCommentId(commentId: number): Promise<string[] | null>;
  deleteById(id: number): Promise<void>;
  addLike(commentId: number, userId: string): Promise<void>;
  removeLike(commentId: number, userId: string): Promise<void>;
}
