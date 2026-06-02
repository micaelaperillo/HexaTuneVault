import type { ValidationArguments } from 'class-validator';
import { DateRangeDtoConstraint } from '../../../../src/dto/validators/date-range.validator';

const args = (object: Record<string, unknown>): ValidationArguments =>
  ({ object }) as unknown as ValidationArguments;

describe('DateRangeDtoConstraint', () => {
  const c = new DateRangeDtoConstraint();

  it('passes when date_from is absent', () => {
    expect(c.validate(undefined, args({ date_to: new Date() }))).toBe(true);
  });

  it('passes when date_to is absent', () => {
    expect(c.validate(undefined, args({ date_from: new Date() }))).toBe(true);
  });

  it('passes when date_from <= date_to', () => {
    expect(
      c.validate(
        undefined,
        args({
          date_from: new Date('2024-01-01'),
          date_to: new Date('2024-02-01'),
        }),
      ),
    ).toBe(true);
  });

  it('fails when date_from is after date_to', () => {
    expect(
      c.validate(
        undefined,
        args({
          date_from: new Date('2024-03-01'),
          date_to: new Date('2024-01-01'),
        }),
      ),
    ).toBe(false);
  });

  it('exposes a default message', () => {
    expect(c.defaultMessage()).toContain('date_from');
  });
});
