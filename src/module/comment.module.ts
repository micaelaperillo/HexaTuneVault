import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from '../entity/comment.entity';
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

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity])],
  controllers: [CommentController],
  providers: [
    CommentService,
    { provide: COMMENT_REPOSITORY, useClass: CommentRepository },
    { provide: CREATE_COMMENT, useExisting: CommentService },
    { provide: DELETE_COMMENT, useExisting: CommentService },
    { provide: SEARCH_COMMENT, useExisting: CommentService },
    { provide: GET_COMMENT, useExisting: CommentService },
    { provide: LIKE_COMMENT, useExisting: CommentService },
    { provide: UNLIKE_COMMENT, useExisting: CommentService },
  ],
})
export class CommentModule {}
