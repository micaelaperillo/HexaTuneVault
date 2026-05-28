import { SubjectReference, SubjectType } from './subject-reference.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';

describe('SubjectReference', () => {
  it('should create a valid reference', () => {
    const ref = new SubjectReference(SubjectType.ALBUM, 1);

    expect(ref.type).toBe('album');
    expect(ref.id).toBe(1);
  });

  it('should throw for zero id', () => {
    expect(() => new SubjectReference(SubjectType.ALBUM, 0)).toThrow(
      InvalidReviewException,
    );
  });

  it('should throw for negative id', () => {
    expect(() => new SubjectReference(SubjectType.TRACK, -5)).toThrow(
      InvalidReviewException,
    );
  });

  it('should throw for non-integer id', () => {
    expect(() => new SubjectReference(SubjectType.ARTIST, 3.14)).toThrow(
      InvalidReviewException,
    );
  });

  it('should throw for NaN id', () => {
    expect(() => new SubjectReference(SubjectType.PODCAST, NaN)).toThrow(
      InvalidReviewException,
    );
  });

  it('should throw for Infinity id', () => {
    expect(() => new SubjectReference(SubjectType.ALBUM, Infinity)).toThrow(
      InvalidReviewException,
    );
  });
});
