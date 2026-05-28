import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { SubjectType } from '@review/domain/model/subject-reference.js';

@Entity('reviews')
@Index(['subjectType', 'subjectId'])
@Index(['createdAt'])
@Index(['authorId', 'subjectType', 'subjectId', 'createdAt'])
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

  @Column({ name: 'subject_id', type: 'int' })
  subjectId!: number;

  @Column({ name: 'author_id', type: 'int' })
  authorId!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}
