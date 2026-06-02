import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  ManyToMany,
  JoinTable,
  VirtualColumn,
  OneToMany,
} from 'typeorm';
import { ReviewEntity } from './review.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column('text')
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ default: '' })
  biography!: string;

  @Column({ length: 256, default: '' })
  location!: string;

  @Column({ default: '' })
  profilePictureUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @VersionColumn()
  version!: number;

  @OneToMany(() => ReviewEntity, (review) => review.author)
  reviews!: ReviewEntity[];

  @ManyToMany(() => UserEntity, (user) => user.followers)
  @JoinTable({
    name: 'user_follows',
    joinColumn: { name: 'follower_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'following_id', referencedColumnName: 'id' },
  })
  following!: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.following)
  followers!: UserEntity[];

  // Computed (not persisted) columns. The `user_follows` join table stores a row
  // `(followerId, followingId)` meaning followerId follows followingId, so the
  // number of followers of this user is the count of rows where it is the
  // followingId, and the number it follows is the count where it is the followerId.
  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(*)::int FROM "user_follows" WHERE "following_id" = ${alias}.id`,
  })
  followerCount?: number;

  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(*)::int FROM "user_follows" WHERE "follower_id" = ${alias}.id`,
  })
  followingCount?: number;
}
