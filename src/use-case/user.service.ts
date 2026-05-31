import { Inject, Injectable } from '@nestjs/common';
import { IAuthenticateUser } from '../port/user/i-authenticate-user.port';
import { ICreateUser } from '../port/user/i-create-user.port';
import { IEditUser } from '../port/user/i-edit-user.port';
import { IDeleteUser } from '../port/user/i-delete-user.port';
import { ISearchUser } from '../port/user/i-search-user.port';
import { IGetUser } from '../port/user/i-get-user.port';
import { IFollowUser } from '../port/user/i-follow-user.port';
import { IListFollows } from '../port/user/i-list-follows.port';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../repository/i-user.repository';
import { TOKEN_ISSUER, type ITokenIssuer } from '../repository/i-token-issuer';

export {
  AUTHENTICATE_USER,
  CREATE_USER,
  EDIT_USER,
  DELETE_USER,
  SEARCH_USER,
  GET_USER,
  FOLLOW_USER,
  LIST_FOLLOWS,
} from '../port/user';
import { UserModel } from '../model/user.model';
import { JwtModel } from '../model/jwt.model';
import { UserFilters } from '../model/user.filter';
import { Page, PageRequest } from '../model/page.model';
import { UserNotFoundException } from '../error/user/user-not-found.exception';
import { AlreadyFollowingException } from '../error/user/already-following.exception';
import { NotFollowingException } from '../error/user/not-following.exception';
import { SelfFollowException } from '../error/user/self-follow.exception';

// TODO hay un par de ifs aca, ver si estar en la misma capa

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
  ): Promise<JwtModel> {
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

  async search(filters: UserFilters): Promise<UserModel[]> {
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
  ): Promise<Page<number>> {
    await this.get(userId);
    return this.repo.findFollowers(userId, page);
  }

  async findFollowing(
    userId: number,
    page: PageRequest,
  ): Promise<Page<number>> {
    await this.get(userId);
    return this.repo.findFollowing(userId, page);
  }
}
