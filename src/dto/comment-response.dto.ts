import { Expose } from 'class-transformer';

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
}
