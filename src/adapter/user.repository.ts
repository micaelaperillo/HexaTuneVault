import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, QueryFailedError } from 'typeorm';
import { UserEntity } from '../entity/user.entity';
import { IUserRepository } from '../repository/i-user.repository';
import { UserModel } from '../model/user.model';
import { UserFilters } from '../model/user.filter';
import { UserDBException } from '../error/user/user-db.exception';
import { InvalidCredentialsException } from '../error/user/invalid-credentials.exception';
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '../repository/i-password-hasher';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
  ) {}

  async create(user: Omit<UserModel, 'id'>): Promise<UserModel> {
    const password = await this.hasher.hash(user.password);
    return this.run(() => this.repo.save({ ...user, password }));
  }

  async findById(id: number): Promise<UserModel | null> {
    return this.run(() => this.repo.findOneBy({ id }));
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
    return this.run(() =>
      this.repo.findBy({
        ...(filters.username !== undefined && {
          username: ILike(`%${filters.username}%`),
        }),
        ...(filters.email !== undefined && {
          email: ILike(`%${filters.email}%`),
        }),
        ...(filters.firstName !== undefined && {
          firstName: ILike(`%${filters.firstName}%`),
        }),
        ...(filters.lastName !== undefined && {
          lastName: ILike(`%${filters.lastName}%`),
        }),
      }),
    );
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

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (e) {
      if (e instanceof QueryFailedError) throw new UserDBException(e.message);
      throw e;
    }
  }
}
