import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AssociatedType } from '../model/comment.associated.type';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: '' })
  createdBy!: string;

  @Column({ default: '' })
  associatedTo!: string;

  @Column({
    type: 'enum',
    enum: AssociatedType,
  })
  associatedType!: AssociatedType;

  @Column('text', { array: true, default: '{}' })
  likedBy!: string[];
}
