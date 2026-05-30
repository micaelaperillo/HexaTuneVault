import { ReviewModel } from './review.model';
import { SubjectReference, SubjectType } from './subject-reference';
import { InvalidReviewException } from '../error/review/invalid-review.exception';

describe('ReviewModel', () => {
  const validSubjectRef = new SubjectReference(SubjectType.ALBUM, '1');

  describe('create', () => {
    it('should create a valid ReviewModel', () => {
      const review = ReviewModel.create({
        subjectRef: validSubjectRef,
        content: 'Great album!',
        rating: 5,
        authorId: '1',
      });

      expect(review.subjectRef).toBe(validSubjectRef);
      expect(review.content).toBe('Great album!');
      expect(review.rating).toBe(5);
      expect(review.authorId).toBe('1');
      expect(review.id).toBeUndefined();
      expect(review.createdAt).toBeUndefined();
      expect(review.updatedAt).toBeNull();
    });

    it('should throw InvalidReviewException if rating is less than 1', () => {
      expect(() => {
        ReviewModel.create({
          subjectRef: validSubjectRef,
          content: 'Awful',
          rating: 0,
          authorId: '1',
        });
      }).toThrow(InvalidReviewException);
    });

    it('should throw InvalidReviewException if rating is greater than 5', () => {
      expect(() => {
        ReviewModel.create({
          subjectRef: validSubjectRef,
          content: 'Amazing',
          rating: 6,
          authorId: '1',
        });
      }).toThrow(InvalidReviewException);
    });

    it('should throw InvalidReviewException if rating is not an integer', () => {
      expect(() => {
        ReviewModel.create({
          subjectRef: validSubjectRef,
          content: 'Good',
          rating: 4.5,
          authorId: '1',
        });
      }).toThrow(InvalidReviewException);
    });

    it('should throw InvalidReviewException if content is empty', () => {
      expect(() => {
        ReviewModel.create({
          subjectRef: validSubjectRef,
          content: '   ',
          rating: 5,
          authorId: '1',
        });
      }).toThrow(InvalidReviewException);
    });

    it('should throw InvalidReviewException if content is over 500 characters', () => {
      expect(() => {
        ReviewModel.create({
          subjectRef: validSubjectRef,
          content: 'a'.repeat(501),
          rating: 5,
          authorId: '1',
        });
      }).toThrow(InvalidReviewException);
    });

    it('should accept content exactly 500 characters', () => {
      const review = ReviewModel.create({
        subjectRef: validSubjectRef,
        content: 'a'.repeat(500),
        rating: 5,
        authorId: '1',
      });
      expect(review.content).toHaveLength(500);
    });

    it('should accept rating of 1 (lower boundary)', () => {
      const review = ReviewModel.create({
        subjectRef: validSubjectRef,
        content: 'Okay',
        rating: 1,
        authorId: '1',
      });
      expect(review.rating).toBe(1);
    });

    it('should accept rating of 5 (upper boundary)', () => {
      const review = ReviewModel.create({
        subjectRef: validSubjectRef,
        content: 'Amazing',
        rating: 5,
        authorId: '1',
      });
      expect(review.rating).toBe(5);
    });

    it('should trim whitespace from content', () => {
      const review = ReviewModel.create({
        subjectRef: validSubjectRef,
        content: '  Great album!  ',
        rating: 4,
        authorId: '1',
      });
      expect(review.content).toBe('Great album!');
    });
  });

  describe('reconstitute', () => {
    it('should return a ReviewModel instance with all provided fields', () => {
      const date = new Date();
      const review = ReviewModel.reconstitute({
        id: 10,
        subjectRef: validSubjectRef,
        content: 'Reconstituted',
        rating: 4,
        createdAt: date,
        authorId: '1',
        updatedAt: null,
      });

      expect(review.id).toBe(10);
      expect(review.content).toBe('Reconstituted');
      expect(review.rating).toBe(4);
      expect(review.createdAt).toBe(date);
      expect(review.authorId).toBe('1');
      expect(review.subjectRef).toBe(validSubjectRef);
      expect(review.updatedAt).toBeNull();
    });

    it('should reconstitute with updatedAt set', () => {
      const date = new Date();
      const updatedAt = new Date();
      const review = ReviewModel.reconstitute({
        id: 10,
        subjectRef: validSubjectRef,
        content: 'Updated',
        rating: 4,
        createdAt: date,
        authorId: '1',
        updatedAt,
      });
      expect(review.updatedAt).toBe(updatedAt);
    });

    it('should throw for invalid id', () => {
      expect(() =>
        ReviewModel.reconstitute({
          id: 0,
          subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
          content: 'Test',
          rating: 3,
          createdAt: new Date(),
          authorId: '1',
          updatedAt: null,
        }),
      ).toThrow(InvalidReviewException);
    });

    it('should throw for invalid rating', () => {
      expect(() =>
        ReviewModel.reconstitute({
          id: 1,
          subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
          content: 'Test',
          rating: 0,
          createdAt: new Date(),
          authorId: '1',
          updatedAt: null,
        }),
      ).toThrow(InvalidReviewException);
    });

    it('should reconstitute valid persisted review', () => {
      const review = ReviewModel.reconstitute({
        id: 1,
        subjectRef: new SubjectReference(SubjectType.ALBUM, '1'),
        content: 'Test',
        rating: 5,
        createdAt: new Date(),
        authorId: '1',
        updatedAt: null,
      });
      expect(review.id).toBe(1);
      expect(review.rating).toBe(5);
    });
  });

  describe('isOwnedBy', () => {
    it('should return true if authorId matches', () => {
      const review = ReviewModel.create({
        subjectRef: validSubjectRef,
        content: 'Test',
        rating: 3,
        authorId: '10',
      });
      expect(review.isOwnedBy('10')).toBe(true);
    });

    it('should return false if authorId does not match', () => {
      const review = ReviewModel.create({
        subjectRef: validSubjectRef,
        content: 'Test',
        rating: 3,
        authorId: '10',
      });
      expect(review.isOwnedBy('99')).toBe(false);
    });
  });
});
