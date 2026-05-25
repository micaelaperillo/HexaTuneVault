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
  UseFilters,
  HttpCode,
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
import { CommentExceptionFilter } from './comment-exception.filter';
import { CommentResponseDto } from '../dto/comment-response.dto';

@UseFilters(CommentExceptionFilter)
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

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deleteComment.deleteById(id);
  }

  @Patch(':id/like')
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this.likeComment.like(id, userId);
  }

  @Patch(':id/unlike')
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id', ParseIntPipe) userId: number,
  ): Promise<void> {
    await this.unlikeComment.unlike(id, userId);
  }
}
