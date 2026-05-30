import { Module } from '@nestjs/common';

import { COMMENT_REPOSITORY } from '../repository/i-comment.repository';
import { CommentRepository } from '../adapter/comment.repository';

import { CommentService } from '../use-case/comment.service';
import {
  CREATE_COMMENT,
  DELETE_COMMENT,
  LIKE_COMMENT,
  UNLIKE_COMMENT,
  GET_COMMENT,
  SEARCH_COMMENT,
} from '../port/comment/';

import { CommentController } from '../controller/comment.controller';

import { DatabaseModule } from '../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CommentController],
  providers: [
    { provide: COMMENT_REPOSITORY, useClass: CommentRepository },
    { provide: CREATE_COMMENT, useClass: CommentService },
    { provide: DELETE_COMMENT, useClass: CommentService },
    { provide: SEARCH_COMMENT, useClass: CommentService },
    { provide: GET_COMMENT, useClass: CommentService },
    { provide: LIKE_COMMENT, useClass: CommentService },
    { provide: UNLIKE_COMMENT, useClass: CommentService },
  ],
})
export class CommentModule {}
