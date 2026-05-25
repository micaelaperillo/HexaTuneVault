import { Inject, Injectable } from '@nestjs/common';
import { ICreateComment } from '../port/i-create-comment.port';
import { IDeleteComment } from '../port/i-delete-comment.port';
import { ISearchComment } from '../port/i-search-comment.port';
import { IGetComment } from '../port/i-get-comment.port';
import { ILikeComment } from '../port/i-like-comment-port';
import { IUnlikeComment } from '../port/i-unlike-comment.port';
import {
  COMMENT_REPOSITORY,
  type ICommentRepository,
} from '../repository/i-comment.repository';
import { CommentModel } from '../model/comment.model';
import { CommentFilters } from '../model/comment-filters.model';

@Injectable()
export class CommentService
  implements
    ICreateComment,
    IDeleteComment,
    ISearchComment,
    IGetComment,
    ILikeComment,
    IUnlikeComment
{
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly repo: ICommentRepository,
  ) {}

  async create(comment: Omit<CommentModel, 'id'>): Promise<CommentModel> {
    return this.repo.create(comment);
  }

  async deleteById(commentId: number): Promise<void> {
    await this.repo.deleteById(commentId);
  }

  async search(filters: CommentFilters): Promise<CommentModel[]> {
    return this.repo.search(filters);
  }

  async get(commentId: number): Promise<CommentModel> {
    const comment = await this.repo.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    return comment;
  }

  async like(commentId: number, userId: number): Promise<void> {
    const comment = await this.repo.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (comment.likedBy.includes(userId)) {
      throw new Error('User already liked this comment');
    }
    await this.repo.addLike(commentId, userId);
  }

  async unlike(commentId: number, userId: number): Promise<void> {
    const comment = await this.repo.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    if (!comment.likedBy.includes(userId)) {
      throw new Error('User has not liked this comment');
    }
    await this.repo.removeLike(commentId, userId);
  }
}
