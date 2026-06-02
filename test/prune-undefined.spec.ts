import { pruneUndefined } from '../src/controller/prune-undefined';

describe('pruneUndefined', () => {
  it('returns an empty object when all values are undefined', () => {
    const result = pruneUndefined({ a: undefined, b: undefined });
    expect(result).toEqual({});
  });

  it('keeps all keys whose values are defined', () => {
    const result = pruneUndefined({ a: 1, b: 'hello', c: false, d: null });
    expect(result).toEqual({ a: 1, b: 'hello', c: false, d: null });
  });

  it('removes only undefined values and keeps the rest', () => {
    const result = pruneUndefined({ a: 1, b: undefined, c: 'x', d: undefined });
    expect(result).toEqual({ a: 1, c: 'x' });
  });

  it('returns an empty object for an empty input', () => {
    const result = pruneUndefined({});
    expect(result).toEqual({});
  });
});
