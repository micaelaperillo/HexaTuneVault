import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { AssociatedType } from '../model/associated-type.enum';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  createdBy!: number;

  @Column()
  associatedTo!: number;

  @Column({
    type: 'enum',
    enum: AssociatedType,
  })
  associatedType!: AssociatedType;

  @Column('int', { array: true, default: '{}' })
  likedBy!: number[];
}
