import type { ValidationArguments } from 'class-validator';
import { SubjectIdRequiresTypeDtoConstraint } from '../../../../src/dto/validators/subject-id-requires-type.validator';
import { SubjectType } from '../../../../src/model/review-subject';

const args = (object: Record<string, unknown>): ValidationArguments =>
  ({ object }) as unknown as ValidationArguments;

describe('SubjectIdRequiresTypeDtoConstraint', () => {
  const c = new SubjectIdRequiresTypeDtoConstraint();

  it('passes when subject_id is absent', () => {
    expect(c.validate(undefined, args({}))).toBe(true);
  });

  it('fails when subject_id is present without subject_type', () => {
    expect(c.validate(undefined, args({ subject_id: 'abc' }))).toBe(false);
  });

  it('passes when subject_id and subject_type are both present', () => {
    expect(
      c.validate(
        undefined,
        args({ subject_id: 'abc', subject_type: SubjectType.ALBUM }),
      ),
    ).toBe(true);
  });

  it('exposes a default message', () => {
    expect(c.defaultMessage()).toContain('subject_type');
  });
});
