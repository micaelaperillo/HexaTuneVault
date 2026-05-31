import { Inject, Injectable } from '@nestjs/common';
import { DataSource, Repository, QueryFailedError } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { IUserRepository } from '../repository/i-user.repository';
import { UserModel } from '../model/user.model';
import { UserFilters } from '../model/user.filter';
import type { Page, PageRequest } from '../model/page.model';
import { UserDBException } from '../error/user/user-db.exception';
import { InvalidCredentialsException } from '../error/user/invalid-credentials.exception';
import { POSTGRES_DB } from '../infrastructure/database/provider/postgres.provider';
import { type IPasswordHasher, PASSWORD_HASHER } from 'src/repository/i-password-hasher';

@Injectable()
export class UserRepository implements IUserRepository {
  private readonly repo: Repository<UserEntity>;
  private readonly hasher: IPasswordHasher;

  constructor(@Inject(POSTGRES_DB) ds: DataSource, @Inject(PASSWORD_HASHER) hasher: IPasswordHasher) {
    this.repo = ds.getRepository(UserEntity);
    this.hasher = hasher;
  }

  async create(user: Omit<UserModel, 'id'>): Promise<UserModel> {
    const password = await this.hasher.hash(user.password);
    return this.run(() => this.repo.save({ ...user, password }));
  }

  async findById(id: number): Promise<UserModel | null> {
    // `followerCount`/`followingCount` are virtual columns selected automatically.
    return this.run(() =>
      this.repo.createQueryBuilder('u').where('u.id = :id', { id }).getOne(),
    );
  }

  async findByUsername(username: string): Promise<UserModel | null> {
    return this.run(() => this.repo.findOneBy({ username }));
  }

  async authenticate(username: string, plaintext: string): Promise<UserModel> {
    const user = await this.findByUsername(username);
    if (!user || !(await this.hasher.verify(plaintext, user.password))) {
      throw new InvalidCredentialsException();
    }
    return user;
  }

  async search(filters: UserFilters): Promise<UserModel[]> {
    return this.run(() => {
      // `followerCount`/`followingCount` are virtual columns selected automatically.
      const qb = this.repo.createQueryBuilder('u');

      if (filters.username !== undefined)
        qb.andWhere('u.username ILIKE :username', {
          username: `%${filters.username}%`,
        });
      if (filters.email !== undefined)
        qb.andWhere('u.email ILIKE :email', { email: `%${filters.email}%` });
      if (filters.firstName !== undefined)
        qb.andWhere('u.firstName ILIKE :firstName', {
          firstName: `%${filters.firstName}%`,
        });
      if (filters.lastName !== undefined)
        qb.andWhere('u.lastName ILIKE :lastName', {
          lastName: `%${filters.lastName}%`,
        });

      return qb.getMany();
    });
  }

  async update(user: Partial<UserModel>): Promise<UserModel> {
    user.password &&= await this.hasher.hash(user.password); 
    return this.run(async () => {
      return this.repo.save(user);
    });
  }

  async deleteById(id: number): Promise<void> {
    await this.run(() => this.repo.softDelete(id));
  }

  async follow(followerId: number, followingId: number): Promise<void> {
    if (await this.isFollowing(followerId, followingId)) return;
    await this.run(() =>
      this.repo
        .createQueryBuilder()
        .relation(UserEntity, 'following')
        .of(followerId)
        .add(followingId),
    );
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    await this.run(() =>
      this.repo
        .createQueryBuilder()
        .relation(UserEntity, 'following')
        .of(followerId)
        .remove(followingId),
    );
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const following = await this.run(() =>
      this.repo
        .createQueryBuilder()
        .relation(UserEntity, 'following')
        .of(followerId)
        .loadMany<UserEntity>(),
    );
    return following.some((user) => user.id === followingId);
  }

  async findFollowers(
    userId: number,
    { page, pageSize }: PageRequest,
  ): Promise<Page<number>> {
    const [rows, total] = await this.run(() =>
      this.repo
        .createQueryBuilder('u')
        .innerJoin('u.following', 'target', 'target.id = :userId', { userId })
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount(),
    );
    return { items: rows.map((u) => u.id), page, pageSize, total };
  }

  async findFollowing(
    userId: number,
    { page, pageSize }: PageRequest,
  ): Promise<Page<number>> {
    const [rows, total] = await this.run(() =>
      this.repo
        .createQueryBuilder('u')
        .innerJoin('u.followers', 'source', 'source.id = :userId', { userId })
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount(),
    );
    return { items: rows.map((u) => u.id), page, pageSize, total };
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof QueryFailedError) throw new UserDBException(e.message);
      throw e;
    }
  }
}
