import { UserService } from '../src/use-case/user.service';
import { InvalidCredentialsException } from '../src/error/user/invalid-credentials.exception';
import type { IUserRepository } from '../src/repository/i-user.repository';
import type { ITokenIssuer } from '../src/repository/i-token-issuer';
import type { UserModel } from '../src/model/user.model';
import type { JwtModel } from '../src/model/jwt.model';
import { UserNotFoundException } from '../src/error/user/user-not-found.exception';
import { SelfFollowException } from '../src/error/user/self-follow.exception';
import { AlreadyFollowingException } from '../src/error/user/already-following.exception';
import { NotFollowingException } from '../src/error/user/not-following.exception';
import type { Page } from '../src/model/page.model';

function makeService(
  repo: Partial<IUserRepository>,
  tokenIssuer?: ITokenIssuer,
) {
  return new UserService(
    repo as IUserRepository,
    tokenIssuer ?? ({} as ITokenIssuer),
  );
}

const storedUser = { id: 1, username: 'alice' } as UserModel;

describe('UserService.create', () => {
  it('persists the new user and returns the stored record with its id', async () => {
    let createCalls = 0;
    let received: Omit<UserModel, 'id'> | undefined;
    const service = makeService({
      create: (user) => {
        createCalls += 1;
        received = user;
        return Promise.resolve(storedUser);
      },
    });

    const input = { username: 'alice', password: 'plain' } as Omit<
      UserModel,
      'id'
    >;
    const result = await service.create(input);

    expect(createCalls).toBe(1);
    expect(received).toBe(input);
    expect(result).toBe(storedUser);
  });
});

describe('UserService.edit', () => {
  it('forwards the partial patch and returns the updated user', async () => {
    let updateCalls = 0;
    let received: Partial<UserModel> | undefined;
    const service = makeService({
      update: (user) => {
        updateCalls += 1;
        received = user;
        return Promise.resolve(storedUser);
      },
    });

    const patch = { id: 1, biography: 'updated bio' };
    const result = await service.edit(patch);

    expect(updateCalls).toBe(1);
    expect(received).toBe(patch);
    expect(result).toBe(storedUser);
  });
});

describe('UserService.get', () => {
  it('returns the user when it exists', async () => {
    const service = makeService({
      findById: () => Promise.resolve(storedUser),
    });

    await expect(service.get(1)).resolves.toBe(storedUser);
  });

  it('throws UserNotFoundException when the user is missing', async () => {
    const service = makeService({ findById: () => Promise.resolve(null) });

    await expect(service.get(99)).rejects.toBeInstanceOf(UserNotFoundException);
  });
});

describe('UserService.follow', () => {
  it('rejects following yourself without touching the repository', async () => {
    let findByIdCalls = 0;
    const service = makeService({
      findById: () => {
        findByIdCalls += 1;
        return Promise.resolve(storedUser);
      },
    });

    await expect(service.follow(1, 1)).rejects.toBeInstanceOf(
      SelfFollowException,
    );
    expect(findByIdCalls).toBe(0);
  });

  it('throws UserNotFoundException when the target does not exist', async () => {
    const service = makeService({
      findById: () => Promise.resolve(null),
      follow: () => Promise.reject(new Error('follow should not be called')),
    });

    await expect(service.follow(1, 2)).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });

  it('throws AlreadyFollowingException when the edge already exists', async () => {
    const service = makeService({
      findById: () => Promise.resolve(storedUser),
      isFollowing: () => Promise.resolve(true),
      follow: () => Promise.reject(new Error('follow should not be called')),
    });

    await expect(service.follow(1, 2)).rejects.toBeInstanceOf(
      AlreadyFollowingException,
    );
  });

  it('creates the follow edge when the target exists and is not yet followed', async () => {
    let followedWith: [number, number] | undefined;
    const service = makeService({
      findById: () => Promise.resolve(storedUser),
      isFollowing: () => Promise.resolve(false),
      follow: (followerId, followingId) => {
        followedWith = [followerId, followingId];
        return Promise.resolve();
      },
    });

    await service.follow(1, 2);

    expect(followedWith).toEqual([1, 2]);
  });
});

describe('UserService.unfollow', () => {
  it('throws NotFollowingException when the edge does not exist', async () => {
    const service = makeService({
      isFollowing: () => Promise.resolve(false),
      unfollow: () =>
        Promise.reject(new Error('unfollow should not be called')),
    });

    await expect(service.unfollow(1, 2)).rejects.toBeInstanceOf(
      NotFollowingException,
    );
  });

  it('removes the follow edge when it exists', async () => {
    let unfollowedWith: [number, number] | undefined;
    const service = makeService({
      isFollowing: () => Promise.resolve(true),
      unfollow: (followerId, followingId) => {
        unfollowedWith = [followerId, followingId];
        return Promise.resolve();
      },
    });

    await service.unfollow(1, 2);

    expect(unfollowedWith).toEqual([1, 2]);
  });
});

describe('UserService.authenticate', () => {
  it('issues a token when the repository validates the credentials', async () => {
    const token: JwtModel = { accessToken: 'token-123' };
    let issuedFor: UserModel | undefined;
    const service = makeService(
      { authenticate: () => Promise.resolve(storedUser) },
      {
        issue: (user) => {
          issuedFor = user;
          return Promise.resolve(token);
        },
      },
    );

    const result = await service.authenticate({
      username: 'alice',
      password: 'plain',
    });

    expect(issuedFor).toBe(storedUser);
    expect(result).toBe(token);
  });

  it('throws InvalidCredentialsException when the repository rejects the credentials', async () => {
    let issueCalled = false;
    const service = makeService(
      {
        authenticate: () => Promise.reject(new InvalidCredentialsException()),
      },
      {
        issue: () => {
          issueCalled = true;
          return Promise.resolve({ accessToken: 'x' });
        },
      },
    );

    await expect(
      service.authenticate({ username: 'alice', password: 'wrong' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsException);
    expect(issueCalled).toBe(false);
  });
});

describe('UserService.findFollowers', () => {
  it('returns the repository page when the user exists', async () => {
    const page: Page<UserModel> = {
      items: [storedUser],
      page: 1,
      pageSize: 20,
      total: 1,
    };
    const service = makeService({
      findById: () => Promise.resolve(storedUser),
      findFollowers: () => Promise.resolve(page),
    });

    const result = await service.findFollowers(1, { page: 1, pageSize: 20 });

    expect(result).toBe(page);
  });

  it('throws UserNotFoundException when the user is missing', async () => {
    const service = makeService({
      findById: () => Promise.resolve(null),
      findFollowers: () =>
        Promise.reject(new Error('findFollowers should not be called')),
    });

    await expect(
      service.findFollowers(99, { page: 1, pageSize: 20 }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});

describe('UserService.findFollowing', () => {
  it('returns the repository page when the user exists', async () => {
    const page: Page<UserModel> = {
      items: [storedUser],
      page: 1,
      pageSize: 20,
      total: 1,
    };
    const service = makeService({
      findById: () => Promise.resolve(storedUser),
      findFollowing: () => Promise.resolve(page),
    });

    const result = await service.findFollowing(1, { page: 1, pageSize: 20 });

    expect(result).toBe(page);
  });

  it('throws UserNotFoundException when the user is missing', async () => {
    const service = makeService({
      findById: () => Promise.resolve(null),
      findFollowing: () =>
        Promise.reject(new Error('findFollowing should not be called')),
    });

    await expect(
      service.findFollowing(99, { page: 1, pageSize: 20 }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
