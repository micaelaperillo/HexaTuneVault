import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReviewEntity } from './review.entity';
import { UserEntity } from './user.entity';

// Join table: a like is uniquely identified by (review, user), which is the
// composite primary key — no surrogate id or separate unique constraint needed.
@Entity('review_likes')
export class ReviewLikeEntity {
  @PrimaryColumn({ name: 'review_id', type: 'int' })
  reviewId!: number;

  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => ReviewEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review!: ReviewEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
