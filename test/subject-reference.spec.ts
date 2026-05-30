import { SubjectReference, SubjectType } from '../src/model/subject-reference';
import { InvalidReviewException } from '../src/error/review/invalid-review.exception';

describe('SubjectReference', () => {
  it('should create a valid reference', () => {
    const ref = new SubjectReference(SubjectType.ALBUM, '1');

    expect(ref.type).toBe('album');
    expect(ref.id).toBe('1');
  });

  it('should throw for empty string id', () => {
    expect(() => new SubjectReference(SubjectType.ALBUM, '')).toThrow(
      InvalidReviewException,
    );
  });

  it('should throw for blank (whitespace-only) id', () => {
    expect(() => new SubjectReference(SubjectType.TRACK, '   ')).toThrow(
      InvalidReviewException,
    );
  });

  it('should accept a non-numeric string id', () => {
    const ref = new SubjectReference(SubjectType.ARTIST, 'abc-123');

    expect(ref.id).toBe('abc-123');
  });
});
