import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  CREATE_COMMENT,
  type ICreateComment,
} from '../port/i-create-comment.port';
import {
  DELETE_COMMENT,
  type IDeleteComment,
} from '../port/i-delete-comment.port';
import {
  SEARCH_COMMENT,
  type ISearchComment,
} from '../port/i-search-comment.port';
import { GET_COMMENT, type IGetComment } from '../port/i-get-comment.port';
import { LIKE_COMMENT, type ILikeComment } from '../port/i-like-comment-port';
import {
  UNLIKE_COMMENT,
  type IUnlikeComment,
} from '../port/i-unlike-comment.port';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentFiltersDto } from '../dto/comment-filters.dto';
import { CommentNotFoundException } from '../exceptions/comment-not-found.exception';
import { AlreadyLikedException } from '../exceptions/already-liked.exception';
import { NotLikedException } from '../exceptions/not-liked.exception';

@Controller('comments')
export class CommentController {
  constructor(
    @Inject(CREATE_COMMENT) private readonly createComment: ICreateComment,
    @Inject(DELETE_COMMENT) private readonly deleteComment: IDeleteComment,
    @Inject(SEARCH_COMMENT) private readonly searchComment: ISearchComment,
    @Inject(GET_COMMENT) private readonly getComment: IGetComment,
    @Inject(LIKE_COMMENT) private readonly likeComment: ILikeComment,
    @Inject(UNLIKE_COMMENT) private readonly unlikeComment: IUnlikeComment,
  ) {}

  @Post()
  create(@Body() dto: CreateCommentDto) {
    return this.createComment.create(dto);
  }

  @Get()
  search(@Query() filters: CommentFiltersDto) {
    return this.searchComment.search(filters);
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.getComment.get(id);
    } catch (e) {
      if (e instanceof CommentNotFoundException)
        throw new NotFoundException(e.message);
      throw e;
    }
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.deleteComment.deleteById(id);
  }

  @Patch(':id/like')
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.likeComment.like(id, userId);
    } catch (e) {
      if (e instanceof CommentNotFoundException)
        throw new NotFoundException(e.message);
      if (e instanceof AlreadyLikedException)
        throw new ConflictException(e.message);
      throw e;
    }
  }

  @Patch(':id/unlike')
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.unlikeComment.unlike(id, userId);
    } catch (e) {
      if (e instanceof CommentNotFoundException)
        throw new NotFoundException(e.message);
      if (e instanceof NotLikedException)
        throw new ConflictException(e.message);
      throw e;
    }
  }
}
