import type { CommentModel } from '../model';

import {
  Controller,
  Inject,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';

import {
  CREATE_COMMENT,
  type ICreateComment,
  DELETE_COMMENT,
  type IDeleteComment,
  SEARCH_COMMENT,
  type ISearchComment,
  GET_COMMENT,
  type IGetComment,
  GET_COMMENT_REPLIES,
  type IGetCommentReplies,
  HAS_LIKED_COMMENT,
  type IHasLikedComment,
  LIKE_COMMENT,
  type ILikeComment,
} from '../port/comment/';

import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentFiltersDto } from '../dto/comment-filters.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { CommentLikeQueryDto } from '../dto/comment-like-query.dto';
import { SetCommentLikeDto } from '../dto/set-comment-like.dto';

import { plainToInstance } from 'class-transformer';

@Controller('api/comments')
export class CommentController {
  constructor(
    @Inject(CREATE_COMMENT) private readonly createComment: ICreateComment,
    @Inject(DELETE_COMMENT) private readonly deleteComment: IDeleteComment,
    @Inject(SEARCH_COMMENT) private readonly searchComment: ISearchComment,
    @Inject(GET_COMMENT) private readonly getComment: IGetComment,
    @Inject(GET_COMMENT_REPLIES)
    private readonly getCommentReplies: IGetCommentReplies,
    @Inject(HAS_LIKED_COMMENT)
    private readonly commentHasLiked: IHasLikedComment,
    @Inject(LIKE_COMMENT) private readonly likeComment: ILikeComment,
  ) {}

  @Post()
  async create(@Body() dto: CreateCommentDto): Promise<CommentResponseDto> {
    // TODO: Use AuthGuard for current user
    const comment = await this.createComment.create({
      content: dto.content,
      createdBy: { id: dto.createdById },
      parentReview: { id: dto.parentReviewId },
      parentCommentId: dto.parentCommentId ?? null,
    });

    return CommentController.toResponse(comment);
  }

  @Get()
  async search(
    @Query() filters: CommentFiltersDto,
  ): Promise<CommentResponseDto[]> {
    const comments = await this.searchComment.search({
      createdById: filters.createdById,
      content: filters.content,
      parentReviewId: filters.reviewId,
    });

    return comments.map(CommentController.toResponse);
  }

  @Get(':id')
  async get(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentResponseDto> {
    const comment = await this.getComment.get(id);
    return CommentController.toResponse(comment);
  }

  @Get(':id/replies')
  async getReplies(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentResponseDto[]> {
    const replies = await this.getCommentReplies.getReplies(id);
    return replies.map(CommentController.toResponse);
  }

  @Get(':id/like')
  @HttpCode(204)
  async hasLiked(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: CommentLikeQueryDto,
  ): Promise<void> {
    const liked = await this.commentHasLiked.hasLiked(id, query.user_id);
    if (!liked) {
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteComment.deleteById(id);
  }

  @Patch(':id/like')
  async setLike(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetCommentLikeDto,
  ): Promise<void> {
    await this.likeComment.setLike(id, dto.user_id, dto.liked);
  }

  private static toResponse(this: void, comment: CommentModel) {
    return plainToInstance(
      CommentResponseDto,
      {
        ...comment,
        self: `/api/comments/${comment.id}`,
        like: `/api/comments/${comment.id}/like`,
        likes: `/api/comments/${comment.id}/likes`,
        replies: `/api/comments/${comment.id}/replies`,
        collection: `/api/comments`,
        author: `/api/users/${comment.createdBy.id}`,
        review: `/api/reviews/${comment.parentReview.id}`,
        parent: comment.parentCommentId
          ? `/api/comments/${comment.parentCommentId}`
          : undefined,
      },
      { excludeExtraneousValues: true },
    );
  }
}
