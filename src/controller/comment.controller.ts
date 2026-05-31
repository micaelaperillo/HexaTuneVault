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
  UseFilters,
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
  GET_COMMENT_LIKES,
  type IGetCommentLikes,
  LIKE_COMMENT,
  type ILikeComment,
  UNLIKE_COMMENT,
  type IUnlikeComment,
} from '../port/comment/';

import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentFiltersDto } from '../dto/comment-filters.dto';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { UserLinkDto } from '../dto/user-link.dto';

import {
  NotFoundMapper,
  ConflictMapper,
  InternalServerErrorMapper,
} from '../infrastructure/filter/http-exception.mappers';

@UseFilters(NotFoundMapper, ConflictMapper, InternalServerErrorMapper)
@Controller('api/comments')
export class CommentController {
  constructor(
    @Inject(CREATE_COMMENT) private readonly createComment: ICreateComment,
    @Inject(DELETE_COMMENT) private readonly deleteComment: IDeleteComment,
    @Inject(SEARCH_COMMENT) private readonly searchComment: ISearchComment,
    @Inject(GET_COMMENT) private readonly getComment: IGetComment,
    @Inject(GET_COMMENT_LIKES)
    private readonly getCommentLikes: IGetCommentLikes,
    @Inject(LIKE_COMMENT) private readonly likeComment: ILikeComment,
    @Inject(UNLIKE_COMMENT) private readonly unlikeComment: IUnlikeComment,
  ) {}

  @Post()
  async create(@Body() dto: CreateCommentDto): Promise<CommentResponseDto> {
    const comment = await this.createComment.create(dto);
    return CommentResponseDto.from(comment);
  }

  @Get()
  async search(
    @Query() filters: CommentFiltersDto,
  ): Promise<CommentResponseDto[]> {
    const comments = await this.searchComment.search(filters);
    return CommentResponseDto.fromMany(comments);
  }

  @Get(':id')
  async get(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentResponseDto> {
    const comment = await this.getComment.get(id);
    return CommentResponseDto.from(comment);
  }

  @Get(':id/likes')
  async getLikes(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserLinkDto[]> {
    const likes = await this.getCommentLikes.getLikes(id);
    return UserLinkDto.fromMany(likes);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteComment.deleteById(id);
  }

  @Patch(':id/like')
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id') userId: string,
  ): Promise<void> {
    await this.likeComment.like(id, userId);
  }

  @Patch(':id/unlike')
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id') userId: string,
  ): Promise<void> {
    await this.unlikeComment.unlike(id, userId);
  }
}
