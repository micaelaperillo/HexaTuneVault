/* eslint-disable @typescript-eslint/require-await */
import { MapErrors } from '../src/common/map-errors.decorator';

class FooError extends Error {}
class BarError extends FooError {}
class MappedError extends Error {}
class GuardedError extends Error {
  constructor(public readonly code: string) {
    super('guarded');
  }
}

describe('MapErrors', () => {
  it('translates a matching error via its class key', async () => {
    class Svc {
      @MapErrors({ from: FooError, to: () => new MappedError() })
      async run(): Promise<void> {
        throw new FooError('boom');
      }
    }

    await expect(new Svc().run()).rejects.toBeInstanceOf(MappedError);
  });

  it('passes the original error instance to `to`', async () => {
    class Svc {
      @MapErrors({
        from: FooError,
        to: (e) => new MappedError(`wrapped: ${e.message}`),
      })
      async run(): Promise<void> {
        throw new FooError('detail');
      }
    }

    await expect(new Svc().run()).rejects.toThrow('wrapped: detail');
  });

  it('rethrows unmatched errors untouched', async () => {
    const bug = new TypeError('real bug');
    class Svc {
      @MapErrors({ from: FooError, to: () => new MappedError() })
      async run(): Promise<void> {
        throw bug;
      }
    }

    await expect(new Svc().run()).rejects.toBe(bug);
  });

  it('respects rule order (specific before general)', async () => {
    class Svc {
      @MapErrors(
        { from: BarError, to: () => new MappedError() },
        { from: FooError, to: () => new Error('general') },
      )
      async run(): Promise<void> {
        throw new BarError('subclass');
      }
    }

    await expect(new Svc().run()).rejects.toBeInstanceOf(MappedError);
  });

  it('only maps when the optional `when` guard passes', async () => {
    class Svc {
      @MapErrors({
        from: GuardedError,
        when: (e) => e.code === '23503',
        to: () => new MappedError(),
      })
      async run(error: GuardedError): Promise<void> {
        throw error;
      }
    }

    await expect(
      new Svc().run(new GuardedError('23503')),
    ).rejects.toBeInstanceOf(MappedError);
    const other = new GuardedError('08006');
    await expect(new Svc().run(other)).rejects.toBe(other);
  });

  it('preserves the return value when nothing throws', async () => {
    class Svc {
      @MapErrors({ from: FooError, to: () => new MappedError() })
      async run(): Promise<number> {
        return 42;
      }
    }

    await expect(new Svc().run()).resolves.toBe(42);
  });
});
