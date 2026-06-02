import type { ValidationArguments } from 'class-validator';
import { MaxRatingDtoConstraint } from '../../../../src/dto/validators/max-rating.validator';

const args = (object: Record<string, unknown>): ValidationArguments =>
  ({ object }) as unknown as ValidationArguments;

describe('MaxRatingDtoConstraint', () => {
  const c = new MaxRatingDtoConstraint();

  it('passes when min_rating is absent', () => {
    expect(c.validate(undefined, args({ max_rating: 3 }))).toBe(true);
  });

  it('passes when max_rating is absent', () => {
    expect(c.validate(undefined, args({ min_rating: 3 }))).toBe(true);
  });

  it('passes when min_rating <= max_rating', () => {
    expect(c.validate(undefined, args({ min_rating: 1, max_rating: 3 }))).toBe(
      true,
    );
  });

  it('fails when min_rating > max_rating', () => {
    expect(c.validate(undefined, args({ min_rating: 5, max_rating: 2 }))).toBe(
      false,
    );
  });

  it('exposes a default message', () => {
    expect(c.defaultMessage()).toContain('min_rating');
  });
});
