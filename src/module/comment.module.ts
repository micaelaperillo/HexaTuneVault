import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentEntity } from '../entity/comment.entity';
import { COMMENT_REPOSITORY } from '../repository/i-comment.repository';
import { CommentRepository } from '../adapter/comment.repository';

import { CommentService } from '../use-case/comment.service';
import {
  CREATE_COMMENT,
  DELETE_COMMENT,
  GET_COMMENT,
  GET_COMMENT_REPLIES,
  LIKE_COMMENT,
  SEARCH_COMMENT,
} from '../port/comment/';

import { CommentController } from '../controller/comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity])],
  controllers: [CommentController],
  providers: [
    { provide: COMMENT_REPOSITORY, useClass: CommentRepository },
    { provide: CREATE_COMMENT, useClass: CommentService },
    { provide: DELETE_COMMENT, useClass: CommentService },
    { provide: SEARCH_COMMENT, useClass: CommentService },
    { provide: GET_COMMENT, useClass: CommentService },
    { provide: GET_COMMENT_REPLIES, useClass: CommentService },
    { provide: LIKE_COMMENT, useClass: CommentService },
  ],
})
export class CommentModule {}
