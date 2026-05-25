import { AssociatedType } from '../model/associated-type.enum';
import { CommentFilters } from '../model/comment-filters.model';
import { CommentModel } from '../model/comment.model';

export const COMMENT_REPOSITORY = Symbol('ICommentRepository');

export interface ICommentRepository {
  create(comment: Omit<CommentModel, 'id'>): Promise<CommentModel>;
  findById(id: number): Promise<CommentModel | null>;
  search(filters: CommentFilters): Promise<CommentModel[]>;
  findByAssociatedId(
    associatedId: number,
    associatedType: AssociatedType,
  ): Promise<CommentModel[]>;
  deleteById(id: number): Promise<void>;
  addLike(commentId: number, userId: number): Promise<void>;
  removeLike(commentId: number, userId: number): Promise<void>;
}
