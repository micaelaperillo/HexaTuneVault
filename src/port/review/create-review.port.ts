import type { ReviewModel } from '../../model/review.model';
import type { SubjectType } from '../../model/subject-reference';

export interface CreateReviewCommand {
  content: string;
  rating: number;
  subjectType: SubjectType;
  subjectId: string;
  authorId: string;
}

export interface ICreateReview {
  create(cmd: CreateReviewCommand): Promise<ReviewModel>;
}
