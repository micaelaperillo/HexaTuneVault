import { JwtTokenRepository } from '../../../src/adapter/jwt-token.repository';
import { InvalidTokenException } from '../../../src/error/auth/invalid-token.exception';
import type { JwtService } from '@nestjs/jwt';
import type { UserModel } from '../../../src/model/user.model';

function makeRepository(jwt: {
  signAsync?: (payload: unknown) => Promise<string>;
  verifyAsync?: (token: string) => Promise<unknown>;
}): JwtTokenRepository {
  return new JwtTokenRepository(jwt as unknown as JwtService);
}

describe('JwtTokenRepository.issue', () => {
  it('signs a token whose subject is the user id', async () => {
    let signed: unknown;
    const repository = makeRepository({
      signAsync: (payload) => {
        signed = payload;
        return Promise.resolve('signed-token');
      },
    });

    const result = await repository.issue({ id: 7 } as UserModel);

    expect(signed).toEqual({ sub: 7 });
    expect(result).toEqual({ accessToken: 'signed-token' });
  });
});

describe('JwtTokenRepository.verify', () => {
  it('maps the token subject to the user id', async () => {
    const repository = makeRepository({
      verifyAsync: () => Promise.resolve({ sub: 7 }),
    });

    const principal = await repository.verify('good-token');

    expect(principal).toEqual({ id: 7 });
  });

  it('throws InvalidTokenException when verification fails', async () => {
    const repository = makeRepository({
      verifyAsync: () => Promise.reject(new Error('jwt expired')),
    });

    await expect(repository.verify('bad-token')).rejects.toBeInstanceOf(
      InvalidTokenException,
    );
  });

  it('throws InvalidTokenException when sub is a non-integer string', async () => {
    const repository = makeRepository({
      verifyAsync: () => Promise.resolve({ sub: 'not-a-number' }),
    });

    await expect(repository.verify('bad-sub-token')).rejects.toBeInstanceOf(
      InvalidTokenException,
    );
  });

  it('throws InvalidTokenException when sub is zero', async () => {
    const repository = makeRepository({
      verifyAsync: () => Promise.resolve({ sub: 0 }),
    });

    await expect(repository.verify('zero-sub-token')).rejects.toBeInstanceOf(
      InvalidTokenException,
    );
  });

  it('throws InvalidTokenException when sub is negative', async () => {
    const repository = makeRepository({
      verifyAsync: () => Promise.resolve({ sub: -1 }),
    });

    await expect(repository.verify('neg-sub-token')).rejects.toBeInstanceOf(
      InvalidTokenException,
    );
  });
});
