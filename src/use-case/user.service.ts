import { Inject, Injectable } from '@nestjs/common';
import { IAuthenticateUser } from '../port/in/user/authenticate-user.port';
import { ICreateUser } from '../port/in/user/create-user.port';
import { IEditUser } from '../port/in/user/edit-user.port';
import { IDeleteUser } from '../port/in/user/delete-user.port';
import { ISearchUser } from '../port/in/user/search-user.port';
import { IGetUser } from '../port/in/user/get-user.port';
import { IFollowUser } from '../port/in/user/follow-user.port';
import { IListFollows } from '../port/in/user/list-follows.port';
import {
  USER_REPOSITORY,
  type IUserRepository,
  TOKEN_ISSUER,
  type ITokenIssuer,
} from '../port/out';

export {
  AUTHENTICATE_USER,
  CREATE_USER,
  EDIT_USER,
  DELETE_USER,
  SEARCH_USER,
  GET_USER,
  FOLLOW_USER,
  LIST_FOLLOWS,
} from '../port/in/user';
import { UserModel } from '../model/user.model';
import { AuthToken } from '../model/auth-token.model';
import { UserFilters } from '../model/user-filter.model';
import { Page, PageRequest } from '../model/page.model';
import { UserNotFoundException } from '../error/user/user-not-found.exception';
import { AlreadyFollowingException } from '../error/user/already-following.exception';
import { NotFollowingException } from '../error/user/not-following.exception';
import { SelfFollowException } from '../error/user/self-follow.exception';

@Injectable()
export class UserService
  implements
    IAuthenticateUser,
    ICreateUser,
    IEditUser,
    IDeleteUser,
    ISearchUser,
    IGetUser,
    IFollowUser,
    IListFollows
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repo: IUserRepository,
    @Inject(TOKEN_ISSUER)
    private readonly tokenIssuer: ITokenIssuer,
  ) {}

  async authenticate(
    credentials: Pick<UserModel, 'username' | 'password'>,
  ): Promise<AuthToken> {
    const user = await this.repo.authenticate(
      credentials.username,
      credentials.password,
    );
    return this.tokenIssuer.issue(user);
  }

  async create(user: Omit<UserModel, 'id'>): Promise<UserModel> {
    return this.repo.create(user);
  }

  async edit(user: Partial<UserModel>): Promise<UserModel> {
    return this.repo.update(user);
  }

  async deleteById(userId: number): Promise<void> {
    await this.repo.deleteById(userId);
  }

  async search(filters: UserFilters): Promise<Page<UserModel>> {
    return this.repo.search(filters);
  }

  async get(userId: number): Promise<UserModel> {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new UserNotFoundException(userId);
    }
    return user;
  }

  async follow(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new SelfFollowException(followerId);
    }
    const target = await this.repo.findById(followingId);
    if (!target) {
      throw new UserNotFoundException(followingId);
    }
    if (await this.repo.isFollowing(followerId, followingId)) {
      throw new AlreadyFollowingException(followerId, followingId);
    }
    await this.repo.follow(followerId, followingId);
  }

  async unfollow(followerId: number, followingId: number): Promise<void> {
    if (!(await this.repo.isFollowing(followerId, followingId))) {
      throw new NotFollowingException(followerId, followingId);
    }
    await this.repo.unfollow(followerId, followingId);
  }

  async findFollowers(
    userId: number,
    page: PageRequest,
  ): Promise<Page<UserModel>> {
    await this.get(userId);
    return this.repo.findFollowers(userId, page);
  }

  async findFollowing(
    userId: number,
    page: PageRequest,
  ): Promise<Page<UserModel>> {
    await this.get(userId);
    return this.repo.findFollowing(userId, page);
  }
}
