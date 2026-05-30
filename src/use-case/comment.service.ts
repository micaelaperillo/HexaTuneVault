import { Inject, Injectable } from '@nestjs/common';
import { ICreateComment } from '../port/comment/i-create-comment.port';
import { IDeleteComment } from '../port/comment/i-delete-comment.port';
import { ISearchComment } from '../port/comment/i-search-comment.port';
import { IGetComment } from '../port/comment/i-get-comment.port';
import { ILikeComment } from '../port/comment/i-like-comment-port';
import { IUnlikeComment } from '../port/comment/i-unlike-comment.port';
import {
  COMMENT_REPOSITORY,
  type ICommentRepository,
} from '../repository/i-comment.repository';
import { CommentModel } from '../model/comment.model';
import { CommentFilters } from '../model/comment.filter';
import { CommentNotFoundException } from '../error/comment/comment-not-found.exception';
import { NotLikedException } from '../error/comment/not-liked.exception';
import { AlreadyLikedException } from '../error/comment/already-liked.exception';

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

  async create(
    comment: Omit<CommentModel, 'id' | 'createdAt' | 'likedBy'>,
  ): Promise<CommentModel> {
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
      throw new CommentNotFoundException(commentId);
    }
    return comment;
  }

  async like(commentId: number, userId: string): Promise<void> {
    const comment = await this.repo.findById(commentId);
    if (!comment) {
      throw new CommentNotFoundException(commentId);
    }
    if (comment.likedBy.includes(userId)) {
      throw new AlreadyLikedException(commentId, userId);
    }
    await this.repo.addLike(commentId, userId);
  }

  async unlike(commentId: number, userId: string): Promise<void> {
    const comment = await this.repo.findById(commentId);
    if (!comment) {
      throw new CommentNotFoundException(commentId);
    }
    if (!comment.likedBy.includes(userId)) {
      throw new NotLikedException(commentId, userId);
    }
    await this.repo.removeLike(commentId, userId);
  }
}
