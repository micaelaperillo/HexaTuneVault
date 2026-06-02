import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from '../../../../src/infrastructure/auth/current-user.decorator';

type ParamFactory = (data: unknown, ctx: ExecutionContext) => unknown;

function paramFactory(): ParamFactory {
  class Probe {
    handler(@CurrentUser() user: unknown): unknown {
      return user;
    }
  }
  const meta = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    Probe,
    'handler',
  ) as Record<string, { factory: ParamFactory }>;
  const key = Object.keys(meta)[0];
  return meta[key].factory;
}

describe('CurrentUser decorator', () => {
  const factory = paramFactory();
  const contextWith = (user: unknown): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  it('returns the authenticated user from the request', () => {
    expect(factory(undefined, contextWith({ id: 7 }))).toEqual({ id: 7 });
  });

  it('returns undefined when the request has no user', () => {
    expect(factory(undefined, contextWith(undefined))).toBeUndefined();
  });
});
