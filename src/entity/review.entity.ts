import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import type { SubjectType } from '../model/review-subject';
import { UserEntity } from './user.entity';

@Entity('reviews')
@Index(['subjectType', 'subjectId'])
@Index(['createdAt'])
@Index(['author', 'subjectType', 'subjectId', 'createdAt'])
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'content', type: 'varchar', length: 500 })
  content!: string;

  @Column({ name: 'rating', type: 'smallint' })
  rating!: number;

  @Column({
    name: 'subject_type',
    type: 'enum',
    enum: ['album', 'track', 'artist', 'podcast'],
  })
  subjectType!: SubjectType;

  @Column({ name: 'subject_id', type: 'varchar' })
  subjectId!: string;

  @ManyToOne(() => UserEntity, (user) => user.reviews, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_id' })
  author!: UserEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
