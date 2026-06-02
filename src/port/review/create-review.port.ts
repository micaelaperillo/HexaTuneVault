import type { UserModel } from '../../model';
import type { ReviewModel } from '../../model/review.model';
import type { SubjectType } from '../../model/subject-reference';

export interface CreateReviewCommand {
  content: string;
  rating: number;
  subjectType: SubjectType;
  subjectId: string;
  author: Pick<UserModel, 'id'>;
}

export const CREATE_REVIEW = Symbol('ICreateReview');

export interface ICreateReview {
  create(cmd: CreateReviewCommand): Promise<ReviewModel>;
}
