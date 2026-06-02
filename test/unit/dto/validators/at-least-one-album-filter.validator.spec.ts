import type { ValidationArguments } from 'class-validator';
import { AtLeastOneAlbumFilterConstraint } from '../../../../src/dto/validators/at-least-one-album-filter.validator';

const args = (object: Record<string, unknown>): ValidationArguments =>
  ({ object }) as unknown as ValidationArguments;

describe('AtLeastOneAlbumFilterConstraint', () => {
  const c = new AtLeastOneAlbumFilterConstraint();

  it('rejects when q, artist and year are all absent', () => {
    expect(c.validate(undefined, args({}))).toBe(false);
  });

  it('accepts when q is present', () => {
    expect(c.validate(undefined, args({ q: 'abc' }))).toBe(true);
  });

  it('accepts when only artist is present', () => {
    expect(c.validate(undefined, args({ artist: 'abc' }))).toBe(true);
  });

  it('accepts when only year is present', () => {
    expect(c.validate(undefined, args({ year: 1999 }))).toBe(true);
  });

  it('exposes a default message', () => {
    expect(c.defaultMessage()).toContain('at least one');
  });
});
