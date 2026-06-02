import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { UserEntity } from './user.entity';

// Join table: a like is uniquely identified by (comment, user), which is the
// composite primary key — no surrogate id or separate unique constraint needed.
@Entity('comment_likes')
export class CommentLikeEntity {
  @PrimaryColumn({ name: 'comment_id', type: 'int' })
  commentId!: number;

  @PrimaryColumn({ name: 'user_id', type: 'int' })
  userId!: number;

  @ManyToOne(() => CommentEntity, (comment) => comment.likeRows, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment!: CommentEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;
}
