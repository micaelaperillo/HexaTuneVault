import { Expose } from 'class-transformer';

export class ReviewResponse {
  @Expose()
  id!: number;

  @Expose()
  content!: string;

  @Expose()
  rating!: number;

  @Expose()
  created_at!: Date;

  @Expose()
  updated_at!: Date | null;

  @Expose()
  self!: `/${string}`;

  @Expose()
  collection!: `/${string}`;

  @Expose()
  subject!: `/${string}`;

  @Expose()
  author!: `/${string}`;
}
