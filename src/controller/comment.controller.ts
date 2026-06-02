import type { CommentModel } from '../model';

import {
  Controller,
  Inject,
  Get,
  Post,
  Put,
  Delete,
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
import { CommentLikeCountResponse } from '../dto/comment-like-count-response.dto';
import { PageDto } from '../dto/page.dto';
import { Public } from '../infrastructure/auth/public.decorator';
import { CurrentUser } from '../infrastructure/auth/current-user.decorator';
import type { AuthenticatedUser } from '../model/authenticated-user';

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
  async create(
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CommentResponseDto> {
    const comment = await this.createComment.create({
      content: dto.content,
      createdBy: { id: user.id },
      parentReview: { id: dto.parent_review_id },
      parentCommentId: dto.parent_comment_id ?? null,
    });

    return CommentController.toResponse(comment);
  }

  @Public()
  @Get()
  async search(
    @Query() filters: CommentFiltersDto,
  ): Promise<PageDto<CommentResponseDto>> {
    const { items, total, ...page } = await this.searchComment.search({
      createdById: filters.created_by_id,
      content: filters.content,
      parentReviewId: filters.review_id,
      page: filters.page,
      pageSize: filters.page_size,
    });

    return PageDto.of(items.map(CommentController.toResponse), page, total);
  }

  @Public()
  @Get(':id')
  async get(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentResponseDto> {
    const comment = await this.getComment.get(id);
    return CommentController.toResponse(comment);
  }

  @Public()
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
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    const liked = await this.commentHasLiked.hasLiked(id, user.id);
    if (!liked) {
      throw new NotFoundException();
    }
  }

  @Public()
  @Get(':id/likes/count')
  async likeCount(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentLikeCountResponse> {
    const comment = await this.getComment.get(id);
    return CommentLikeCountResponse.fromCount(id, comment.likes);
  }

  @Put(':id/likes')
  @HttpCode(204)
  async like(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.likeComment.setLike(id, user.id, true);
  }

  @Delete(':id/likes')
  @HttpCode(204)
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.likeComment.setLike(id, user.id, false);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.deleteComment.deleteById(id, user.id);
  }

  private static toResponse(this: void, comment: CommentModel) {
    return plainToInstance(
      CommentResponseDto,
      {
        ...comment,
        created_at: comment.createdAt,
        self: `/api/comments/${comment.id}`,
        like: `/api/comments/${comment.id}/like`,
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
