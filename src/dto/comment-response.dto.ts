import { AssociatedType } from '../model/associated-type';
import { Expose, plainToInstance } from 'class-transformer';
import { CommentModel } from '../model/comment.model';

export class CommentResponseDto {
  @Expose()
  content!: string;
  @Expose()
  createdAt!: Date;
  @Expose()
  associatedType!: AssociatedType;
  @Expose()
  self!: `/${string}`;
  @Expose()
  like!: `/${string}`;
  @Expose()
  unlike!: `/${string}`;
  @Expose()
  collection!: `/${string}`;
  @Expose()
  associated!: `/${string}`;
  @Expose()
  author!: `/${string}`;
  @Expose()
  likes!: `/${string}`;

  static from(model: CommentModel): CommentResponseDto {
    const dto = plainToInstance(CommentResponseDto, model, {
      excludeExtraneousValues: true,
    });
    dto.self = `/api/comments/${model.id}`;
    dto.like = `/api/comments/${model.id}/like`;
    dto.unlike = `/api/comments/${model.id}/unlike`;
    dto.collection = `/api/comments`;
    dto.associated = `/api/${model.associatedType}s/${model.associatedTo}`;
    dto.author = `/api/users/${model.createdBy}`;
    dto.likes = `/api/comments/${model.id}/likes`;
    return dto;
  }

  static fromMany(models: CommentModel[]): CommentResponseDto[] {
    return models.map((model) => CommentResponseDto.from(model));
  }
}
