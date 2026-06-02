import type { ReviewModel } from '../../model/review.model';
import type { SubjectType } from '../../model/subject-reference';

export interface CreateReviewCommand {
  content: string;
  rating: number;
  subjectType: SubjectType;
  subjectId: string;
  authorId: string;
}

export const CREATE_REVIEW = Symbol('ICreateReview');

export interface ICreateReview {
  create(cmd: CreateReviewCommand): Promise<ReviewModel>;
}
