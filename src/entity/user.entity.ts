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
} from 'typeorm';

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

  @ManyToMany(() => UserEntity, (user) => user.followers)
  @JoinTable({
    name: 'user_follows',
    joinColumn: { name: 'followerId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'followingId', referencedColumnName: 'id' },
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
      `SELECT COUNT(*)::int FROM "user_follows" WHERE "followingId" = ${alias}.id`,
  })
  followerCount?: number;

  @VirtualColumn({
    type: 'int',
    query: (alias) =>
      `SELECT COUNT(*)::int FROM "user_follows" WHERE "followerId" = ${alias}.id`,
  })
  followingCount?: number;
}
