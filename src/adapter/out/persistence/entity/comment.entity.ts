import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ReviewEntity } from './review.entity';
import { CommentLikeEntity } from './comment-like.entity';

@Entity('comments')
@Index(['parentReview'])
@Index(['parentComment'])
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: UserEntity;

  @RelationId((comment: CommentEntity) => comment.createdBy)
  createdById!: number;

  @ManyToOne(() => ReviewEntity, {
    nullable: false,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'parent_review_id' })
  parentReview!: ReviewEntity;

  @RelationId((comment: CommentEntity) => comment.parentReview)
  parentReviewId!: number;

  @ManyToOne(() => CommentEntity, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_comment_id' })
  parentComment!: CommentEntity | null;

  @RelationId((comment: CommentEntity) => comment.parentComment)
  parentCommentId!: number | null;

  @OneToMany(() => CommentEntity, (comment) => comment.parentComment)
  replies!: CommentEntity[];

  @OneToMany(() => CommentLikeEntity, (like) => like.comment)
  likeRows!: CommentLikeEntity[];

  // Populated via loadRelationCountAndMap; not a stored column.
  likeCount!: number;
}
