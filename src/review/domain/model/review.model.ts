import { SubjectReference } from './subject-reference.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';

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
      params.rating < 1 ||
      params.rating > 5
    ) {
      throw new InvalidReviewException(
        'Rating must be an integer between 1 and 5',
      );
    }
    const trimmedContent = params.content.trim();
    if (trimmedContent.length === 0 || trimmedContent.length > 500) {
      throw new InvalidReviewException(
        'Content must be between 1 and 500 characters',
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
