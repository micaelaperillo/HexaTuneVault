import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entity/comment.entity';
import { CommentService } from './service/comment.service';
import { COMMENT_REPOSITORY } from './repository/i-comment.repository';
import { CREATE_COMMENT } from './port/i-create-comment.port';
import { DELETE_COMMENT } from './port/i-delete-comment.port';
import { LIKE_COMMENT } from './port/i-like-comment-port';
import { UNLIKE_COMMENT } from './port/i-unlike-comment.port';
import { GET_COMMENT } from './port/i-get-comment.port';
import { SEARCH_COMMENT } from './port/i-search-comment.port';
import { CommentRepository } from './adapter/comment.repository';
import { CommentController } from './adapter/comment.controller';

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
