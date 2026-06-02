import type {
  CommentModel,
  CommentFilters,
  ReviewModel,
  UserModel,
  Page,
} from '../model';

import type {
  ICreateComment,
  IDeleteComment,
  ISearchComment,
  IGetComment,
  IGetCommentReplies,
  ILikeComment,
  IHasLikedComment,
} from '../port/comment';
import {
  COMMENT_REPOSITORY,
  type ICommentRepository,
} from '../repository/comment-repository.port';

import {
  CommentNotFoundException,
  CommentDeletionForbiddenException,
} from '../error/comment';

import { Inject, Injectable } from '@nestjs/common';

export { COMMENT_REPOSITORY } from '../repository/comment-repository.port';

@Injectable()
export class CommentService
  implements
    ICreateComment,
    IDeleteComment,
    ISearchComment,
    IGetComment,
    IGetCommentReplies,
    IHasLikedComment,
    ILikeComment
{
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly repo: ICommentRepository,
  ) {}

  async create(
    comment: Omit<
      CommentModel,
      'id' | 'createdAt' | 'likes' | 'createdBy' | 'parentReview'
    > & {
      createdBy: Pick<UserModel, 'id'>;
      parentReview: Pick<ReviewModel, 'id'>;
    },
  ): Promise<CommentModel> {
    return this.repo.create(comment);
  }

  async deleteById(commentId: number, requesterId: number): Promise<void> {
    const comment = await this.repo.findById(commentId);
    if (!comment) {
      throw new CommentNotFoundException(commentId);
    }
    if (comment.createdBy.id !== requesterId) {
      throw new CommentDeletionForbiddenException();
    }
    await this.repo.deleteById(commentId);
  }

  async search(filters: CommentFilters): Promise<Page<CommentModel>> {
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

  async hasLiked(commentId: number, userId: number): Promise<boolean> {
    return this.repo.hasLike(commentId, userId);
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
