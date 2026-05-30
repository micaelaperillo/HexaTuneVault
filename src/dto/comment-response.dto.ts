import { AssociatedType } from '../model/associated-type.enum';
import { Expose, plainToInstance } from 'class-transformer';
import { CommentModel } from '../model/comment.model';

export class CommentResponseDto {
  @Expose()
  id!: number;
  @Expose()
  content!: string;
  @Expose()
  createdAt!: Date;
  @Expose()
  createdBy!: string;
  @Expose()
  associatedTo!: string;
  @Expose()
  associatedType!: AssociatedType;
  @Expose()
  likedBy!: string[];

  static from(model: CommentModel): CommentResponseDto {
    return plainToInstance(CommentResponseDto, model, {
      excludeExtraneousValues: true,
    });
  }

  static fromMany(models: CommentModel[]): CommentResponseDto[] {
    return models.map((model) => CommentResponseDto.from(model));
  }
}
