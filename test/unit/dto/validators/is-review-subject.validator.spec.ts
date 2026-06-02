import { IsReviewSubjectConstraint } from '../../../../src/dto/validators/is-review-subject.validator';
import { SubjectType } from '../../../../src/model/review-subject';

describe('IsReviewSubjectConstraint', () => {
  const c = new IsReviewSubjectConstraint();

  it('rejects a non-object value', () => {
    expect(c.validate('album')).toBe(false);
  });

  it('rejects null', () => {
    expect(c.validate(null)).toBe(false);
  });

  it('rejects an object with no entries', () => {
    expect(c.validate({})).toBe(false);
  });

  it('rejects an object with more than one entry', () => {
    expect(c.validate({ album: '1', artist: '2' })).toBe(false);
  });

  it('rejects an unknown subject key', () => {
    expect(c.validate({ bogus: '1' })).toBe(false);
  });

  it('rejects a non-string id', () => {
    expect(c.validate({ [SubjectType.ALBUM]: 123 })).toBe(false);
  });

  it('rejects a blank id', () => {
    expect(c.validate({ [SubjectType.ALBUM]: '   ' })).toBe(false);
  });

  it('accepts exactly one valid type mapping to a non-empty id', () => {
    expect(c.validate({ [SubjectType.ALBUM]: 'abc' })).toBe(true);
  });

  it('exposes a default message', () => {
    expect(c.defaultMessage()).toContain('subject must be exactly one');
  });
});
