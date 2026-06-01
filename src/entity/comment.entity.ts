import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  RelationId,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ReviewEntity } from './review.entity';

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

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: UserEntity;

  @RelationId((comment: CommentEntity) => comment.createdBy)
  createdById!: number;

  @ManyToOne(() => ReviewEntity, { nullable: false, onDelete: 'CASCADE' })
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

  @ManyToMany(() => UserEntity)
  @JoinTable({
    name: 'comment_likes',
    joinColumn: { name: 'comment_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  likedBy!: UserEntity[];
}
