import { SubjectReference } from './subject-reference.js';
import { InvalidReviewException } from '@error/review/invalid-review.exception.js';
import {
  RATING_MIN,
  RATING_MAX,
  CONTENT_MIN_LENGTH,
  CONTENT_MAX_LENGTH,
} from '@model/review-constraints.js';

export class ReviewModel {
  private constructor(
    public readonly id: number | undefined,
    public readonly subjectRef: SubjectReference,
    public readonly content: string,
    public readonly rating: number,
    public readonly createdAt: Date | undefined,
    public readonly authorId: number,
    public readonly updatedAt: Date | null,
  ) {}

  static create(params: {
    subjectRef: SubjectReference;
    content: string;
    rating: number;
    authorId: number;
  }): ReviewModel {
    if (
      !Number.isInteger(params.rating) ||
      params.rating < RATING_MIN ||
      params.rating > RATING_MAX
    ) {
      throw new InvalidReviewException(
        `Rating must be an integer between ${RATING_MIN} and ${RATING_MAX}`,
      );
    }
    const trimmedContent = params.content.trim();
    if (
      trimmedContent.length < CONTENT_MIN_LENGTH ||
      trimmedContent.length > CONTENT_MAX_LENGTH
    ) {
      throw new InvalidReviewException(
        `Content must be between ${CONTENT_MIN_LENGTH} and ${CONTENT_MAX_LENGTH} characters`,
      );
    }
    return new ReviewModel(
      undefined,
      params.subjectRef,
      trimmedContent,
      params.rating,
      undefined,
      params.authorId,
      null,
    );
  }

  static reconstitute(params: {
    id: number;
    subjectRef: SubjectReference;
    content: string;
    rating: number;
    createdAt: Date;
    authorId: number;
    updatedAt: Date | null;
  }): ReviewModel {
    if (!Number.isInteger(params.id) || params.id < 1) {
      throw new InvalidReviewException('Persisted review has invalid id');
    }
    if (
      !Number.isInteger(params.rating) ||
      params.rating < RATING_MIN ||
      params.rating > RATING_MAX
    ) {
      throw new InvalidReviewException('Persisted review has invalid rating');
    }
    return new ReviewModel(
      params.id,
      params.subjectRef,
      params.content,
      params.rating,
      params.createdAt,
      params.authorId,
      params.updatedAt,
    );
  }

  isOwnedBy(userId: number): boolean {
    return this.authorId === userId;
  }
}
