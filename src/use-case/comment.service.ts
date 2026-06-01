import { Inject, Injectable } from '@nestjs/common';
import { ICreateComment } from '../port/comment/i-create-comment.port';
import { IDeleteComment } from '../port/comment/i-delete-comment.port';
import { ISearchComment } from '../port/comment/i-search-comment.port';
import { IGetComment } from '../port/comment/i-get-comment.port';
import { IGetCommentReplies } from '../port/comment/i-get-comment-replies.port';
import { IGetCommentLikes } from '../port/comment/i-get-comment-likes.port';
import { ILikeComment } from '../port/comment/i-like-comment-port';
import {
  COMMENT_REPOSITORY,
  type ICommentRepository,
} from '../repository/i-comment.repository';
import { CommentModel } from '../model/comment.model';
import { CommentFilters } from '../model/comment.filter';
import { CommentNotFoundException } from '../error/comment/comment-not-found.exception';

@Injectable()
export class CommentService
  implements
    ICreateComment,
    IDeleteComment,
    ISearchComment,
    IGetComment,
    IGetCommentReplies,
    IGetCommentLikes,
    ILikeComment
{
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly repo: ICommentRepository,
  ) {}

  async create(
    comment: Omit<CommentModel, 'id' | 'createdAt'>,
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

  async getReplies(commentId: number): Promise<CommentModel[]> {
    const comment = await this.repo.findById(commentId);
    if (!comment) {
      throw new CommentNotFoundException(commentId);
    }
    return this.repo.findReplies(commentId);
  }

  async getLikes(commentId: number): Promise<number[]> {
    const likes = await this.repo.findLikesByCommentId(commentId);
    if (!likes) {
      throw new CommentNotFoundException(commentId);
    }
    return likes;
  }

  async setLike(
    commentId: number,
    userId: number,
    liked: boolean,
  ): Promise<void> {
    const comment = await this.repo.findById(commentId);
    if (!comment) {
      throw new CommentNotFoundException(commentId);
    }
    if (liked) {
      await this.repo.addLike(commentId, userId);
    } else {
      await this.repo.removeLike(commentId, userId);
    }
  }
}
