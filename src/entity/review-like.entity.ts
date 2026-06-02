import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReviewEntity } from './review.entity';

// Join table: a like is uniquely identified by (review, user), which is the
// composite primary key — no surrogate id or separate unique constraint needed.
@Entity('review_likes')
export class ReviewLikeEntity {
  @PrimaryColumn({ name: 'review_id', type: 'int' })
  reviewId!: number;

  @PrimaryColumn({ name: 'user_id', type: 'varchar' })
  userId!: string;

  @ManyToOne(() => ReviewEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review?: ReviewEntity;
}
