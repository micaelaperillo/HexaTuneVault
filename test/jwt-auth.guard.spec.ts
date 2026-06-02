import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../src/infrastructure/auth/jwt-auth.guard';
import { Public } from '../src/infrastructure/auth/public.decorator';
import { InvalidTokenException } from '../src/error/auth/invalid-token.exception';
import type { ITokenVerifier } from '../src/repository/token-verifier.port';

const verifier: ITokenVerifier = {
  verify: (token) =>
    token === 'good'
      ? Promise.resolve({ id: 1 })
      : Promise.reject(new InvalidTokenException()),
};

function makeContext(
  request: unknown,
  handler: (...args: unknown[]) => unknown = () => undefined,
  cls: object = class {},
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => cls,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

function makeGuard(override: ITokenVerifier = verifier): JwtAuthGuard {
  return new JwtAuthGuard(new Reflector(), override);
}

describe('JwtAuthGuard', () => {
  it('allows a @Public() route without a token', async () => {
    class PublicController {
      @Public()
      read() {}
    }
    const ctx = makeContext(
      { headers: {} },
      PublicController.prototype.read,
      PublicController,
    );

    await expect(makeGuard().canActivate(ctx)).resolves.toBe(true);
  });

  it('rejects a protected route with no Authorization header', async () => {
    const ctx = makeContext({ headers: {} });

    await expect(makeGuard().canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a non-Bearer Authorization scheme', async () => {
    const ctx = makeContext({ headers: { authorization: 'Basic good' } });

    await expect(makeGuard().canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a Bearer header with extra segments', async () => {
    const ctx = makeContext({
      headers: { authorization: 'Bearer good extra' },
    });

    await expect(makeGuard().canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a Bearer header with an empty token', async () => {
    const ctx = makeContext({ headers: { authorization: 'Bearer ' } });

    await expect(makeGuard().canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects an invalid token', async () => {
    const ctx = makeContext({ headers: { authorization: 'Bearer bad' } });

    await expect(makeGuard().canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('re-throws non-auth errors unchanged', async () => {
    const boom = new Error('verifier exploded');
    const failing: ITokenVerifier = { verify: () => Promise.reject(boom) };
    const ctx = makeContext({ headers: { authorization: 'Bearer good' } });

    await expect(makeGuard(failing).canActivate(ctx)).rejects.toBe(boom);
  });

  it('allows a valid token and attaches the principal to the request', async () => {
    const request: { headers: Record<string, string>; user?: unknown } = {
      headers: { authorization: 'Bearer good' },
    };
    const ctx = makeContext(request);

    await expect(makeGuard().canActivate(ctx)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 1 });
  });
});
