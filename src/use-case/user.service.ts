import { Inject, Injectable } from '@nestjs/common';
import { IAuthenticateUser } from '../port/user/i-authenticate-user.port';
import { ICreateUser } from '../port/user/i-create-user.port';
import { IEditUser } from '../port/user/i-edit-user.port';
import { IDeleteUser } from '../port/user/i-delete-user.port';
import { ISearchUser } from '../port/user/i-search-user.port';
import { IGetUser } from '../port/user/i-get-user.port';
import { IFollowUser } from '../port/user/i-follow-user.port';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../repository/i-user.repository';
import {
  PASSWORD_HASHER,
  type IPasswordHasher,
} from '../repository/i-password-hasher';
import { TOKEN_ISSUER, type ITokenIssuer } from '../repository/i-token-issuer';
import { UserModel } from '../model/user.model';
import { JwtModel } from '../model/jwt.model';
import { UserFilters } from '../model/user.filter';
import { UserNotFoundException } from '../error/user/user-not-found.exception';
import { InvalidCredentialsException } from '../error/user/invalid-credentials.exception';
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
    IFollowUser
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repo: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly hasher: IPasswordHasher,
    @Inject(TOKEN_ISSUER)
    private readonly tokenIssuer: ITokenIssuer,
  ) {}

  async authenticate(
    credentials: Pick<UserModel, 'username' | 'password'>,
  ): Promise<JwtModel> {
    const user = await this.repo.findByUsername(credentials.username);
    if (
      !user ||
      !(await this.hasher.compare(credentials.password, user.password))
    ) {
      throw new InvalidCredentialsException();
    }
    return this.tokenIssuer.issue(user);
  }

  async create(user: Omit<UserModel, 'id'>): Promise<UserModel> {
    const password = await this.hasher.hash(user.password);
    return this.repo.create({ ...user, password });
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
}
