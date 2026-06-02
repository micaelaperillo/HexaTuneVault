import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentEntity } from '../entity/comment.entity';
import { CommentLikeEntity } from '../entity/comment-like.entity';
import { COMMENT_REPOSITORY } from '../repository/comment-repository.port';
import { CommentRepository } from '../adapter/comment.repository';

import { CommentService } from '../use-case/comment.service';
import {
  CREATE_COMMENT,
  DELETE_COMMENT,
  GET_COMMENT,
  GET_COMMENT_REPLIES,
  HAS_LIKED_COMMENT,
  LIKE_COMMENT,
  SEARCH_COMMENT,
} from '../port/comment/';

import { CommentController } from '../controller/comment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity, CommentLikeEntity])],
  controllers: [CommentController],
  providers: [
    { provide: COMMENT_REPOSITORY, useClass: CommentRepository },
    { provide: CREATE_COMMENT, useClass: CommentService },
    { provide: DELETE_COMMENT, useClass: CommentService },
    { provide: SEARCH_COMMENT, useClass: CommentService },
    { provide: GET_COMMENT, useClass: CommentService },
    { provide: GET_COMMENT_REPLIES, useClass: CommentService },
    { provide: HAS_LIKED_COMMENT, useClass: CommentService },
    { provide: LIKE_COMMENT, useClass: CommentService },
  ],
})
export class CommentModule {}
