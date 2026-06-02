import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TypeORMError } from 'typeorm';
import { MapErrors } from 'error-mapper-decorator';

import { UserEntity } from './entity/user.entity';
import {
  IUserRepository,
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '../../../port/out';
import type { UserModel, UserFilters } from '../../../model/user';
import type { Page, PageRequest } from '../../../model';
import { InvalidCredentialsException } from '../../../error/user/invalid-credentials.exception';
import { containsInsensitive } from './like-escape';
import { UserDBException } from '../../../port/out/persistence.error';

@Injectable()
@MapErrors({
  from: TypeORMError,
  to: (error) => new UserDBException(error.message),
})
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
  ) {}

  async create(user: Omit<UserModel, 'id'>): Promise<UserModel> {
    const password = await this.hasher.hash(user.password);
    const saved = await this.repo.save({ ...user, password });
    return UserRepository.toModel(saved);
  }

  async findById(id: number): Promise<UserModel | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? UserRepository.toModel(entity) : null;
  }

  async findByUsername(username: string): Promise<UserModel | null> {
    const entity = await this.repo.findOneBy({ username });
    return entity ? UserRepository.toModel(entity) : null;
  }

  async authenticate(username: string, plaintext: string): Promise<UserModel> {
    const user = await this.findByUsername(username);
    if (!user || !(await this.hasher.verify(plaintext, user.password))) {
      throw new InvalidCredentialsException();
    }
    return user;
  }

  async search(filters: UserFilters): Promise<Page<UserModel>> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize =
      filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
    const [rows, total] = await this.repo.findAndCount({
      where: {
        username: containsInsensitive(filters.username ?? ''),
        email: containsInsensitive(filters.email ?? ''),
        firstName: containsInsensitive(filters.firstName ?? ''),
        lastName: containsInsensitive(filters.lastName ?? ''),
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items: rows.map(UserRepository.toModel), page, pageSize, total };
  }

  async update(user: Partial<UserModel>): Promise<UserModel> {
    user.password &&= await this.hasher.hash(user.password);
    const saved = await this.repo.save(user);
    return UserRepository.toModel(saved);
  }

  async deleteById(id: number): Promise<void> {
    await this.repo.softDelete(id);
  }

  async follow(followerId: number, followingId: number): Promise<void> {
    if (await this.isFollowing(followerId, followingId)) return;
    await this.repo
      .createQueryBuilder()
      .relation(UserEntity, 'following')
      .of(followerId)
      .add(followingId);
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .relation(UserEntity, 'following')
      .of(followerId)
      .remove(followingId);
  }

  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const following = await this.repo
      .createQueryBuilder()
      .relation(UserEntity, 'following')
      .of(followerId)
      .loadMany<UserEntity>();
    return following.some((user) => user.id === followingId);
  }

  async findFollowers(
    userId: number,
    { page, pageSize }: PageRequest,
  ): Promise<Page<UserModel>> {
    const [rows, total] = await this.repo
      .createQueryBuilder('u')
      .innerJoin('u.following', 'target', 'target.id = :userId', { userId })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items: rows.map(UserRepository.toModel), page, pageSize, total };
  }

  async findFollowing(
    userId: number,
    { page, pageSize }: PageRequest,
  ): Promise<Page<UserModel>> {
    const [rows, total] = await this.repo
      .createQueryBuilder('u')
      .innerJoin('u.followers', 'source', 'source.id = :userId', { userId })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items: rows.map(UserRepository.toModel), page, pageSize, total };
  }

  private static toModel(this: void, entity: UserEntity): UserModel {
    return {
      id: entity.id,
      username: entity.username,
      password: entity.password,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      biography: entity.biography,
      location: entity.location,
      profilePictureUrl: entity.profilePictureUrl,
      followerCount: entity.followerCount,
      followingCount: entity.followingCount,
    };
  }
}
