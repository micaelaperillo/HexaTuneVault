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
  LIKE_COMMENT,
  type ILikeComment,
} from '../port/comment/';

import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentFiltersDto } from '../dto/comment-filters.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { SetCommentLikeDto } from '../dto/set-comment-like.dto';

@Controller('api/comments')
export class CommentController {
  constructor(
    @Inject(CREATE_COMMENT) private readonly createComment: ICreateComment,
    @Inject(DELETE_COMMENT) private readonly deleteComment: IDeleteComment,
    @Inject(SEARCH_COMMENT) private readonly searchComment: ISearchComment,
    @Inject(GET_COMMENT) private readonly getComment: IGetComment,
    @Inject(GET_COMMENT_REPLIES)
    private readonly getCommentReplies: IGetCommentReplies,
    @Inject(LIKE_COMMENT) private readonly likeComment: ILikeComment,
  ) {}

  @Post()
  async create(@Body() dto: CreateCommentDto): Promise<CommentResponseDto> {
    const comment = await this.createComment.create({
      content: dto.content,
      createdById: dto.createdById,
      parentReviewId: dto.parentReviewId,
      parentCommentId: dto.parentCommentId ?? null,
    });
    return CommentResponseDto.from(comment);
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
    return CommentResponseDto.fromMany(comments);
  }

  @Get(':id')
  async get(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentResponseDto> {
    const comment = await this.getComment.get(id);
    return CommentResponseDto.from(comment);
  }

  @Get(':id/replies')
  async getReplies(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentResponseDto[]> {
    const replies = await this.getCommentReplies.getReplies(id);
    return CommentResponseDto.fromMany(replies);
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
}
