import { Module } from '@nestjs/common';
import { CommentService } from '../use-case/comment.service';
import { COMMENT_REPOSITORY } from '../repository/i-comment.repository';
import { CREATE_COMMENT } from '../port/comment/i-create-comment.port';
import { DELETE_COMMENT } from '../port/comment/i-delete-comment.port';
import { LIKE_COMMENT } from '../port/comment/i-like-comment-port';
import { UNLIKE_COMMENT } from '../port/comment/i-unlike-comment.port';
import { GET_COMMENT } from '../port/comment/i-get-comment.port';
import { SEARCH_COMMENT } from '../port/comment/i-search-comment.port';
import { CommentRepository } from '../adapter/comment.repository';
import { CommentController } from '../controller/comment.controller';
import { DatabaseModule } from 'src/infrastructure/database/database.module';

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
