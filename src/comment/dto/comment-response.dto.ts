import { AssociatedType } from '../model/associated-type.enum';
import { Expose } from 'class-transformer';
import { CommentModel } from '../model/comment.model';
import { plainToInstance } from 'class-transformer';

export class CommentResponseDto {
  @Expose()
  id!: number;
  @Expose()
  content!: string;
  @Expose()
  createdAt!: Date;
  @Expose()
  createdBy!: number;
  @Expose()
  associatedTo!: number;
  @Expose()
  associatedType!: AssociatedType;
  @Expose()
  likedBy!: number[];

  static from(model: CommentModel): CommentResponseDto {
    return plainToInstance(CommentResponseDto, model, {
      excludeExtraneousValues: true,
    });
  }

  static fromMany(models: CommentModel[]): CommentResponseDto[] {
    return models.map((model) => CommentResponseDto.from(model));
  }
}
