import { Expose, plainToInstance } from 'class-transformer';
import { CommentModel } from '../model/comment.model';

export class CommentResponseDto {
  @Expose()
  content!: string;
  @Expose()
  createdAt!: Date;
  @Expose()
  self!: `/${string}`;
  @Expose()
  like!: `/${string}`;
  @Expose()
  likes!: `/${string}`;
  @Expose()
  replies!: `/${string}`;
  @Expose()
  collection!: `/${string}`;
  @Expose()
  review!: `/${string}`;
  @Expose()
  parent?: `/${string}`;
  @Expose()
  author!: `/${string}`;

  static from(this: void, model: CommentModel): CommentResponseDto {
    const dto = plainToInstance(CommentResponseDto, model, {
      excludeExtraneousValues: true,
    });
    dto.self = `/api/comments/${model.id}`;
    dto.like = `/api/comments/${model.id}/like`;
    dto.likes = `/api/comments/${model.id}/likes`;
    dto.replies = `/api/comments/${model.id}/replies`;
    dto.collection = `/api/comments`;
    dto.review = `/api/reviews/${model.parentReviewId}`;
    if (model.parentCommentId != null) {
      dto.parent = `/api/comments/${model.parentCommentId}`;
    }
    dto.author = `/api/users/${model.createdById}`;
    return dto;
  }

  static fromMany(models: CommentModel[]): CommentResponseDto[] {
    return models.map(CommentResponseDto.from);
  }
}
