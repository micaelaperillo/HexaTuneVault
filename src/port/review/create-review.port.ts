import type { ReviewModel } from '@model/review.model.js';
import type { SubjectType } from '@model/subject-reference.js';

export interface CreateReviewCommand {
  content: string;
  rating: number;
  subjectType: SubjectType;
  subjectId: number;
  authorId: number;
}

export interface ICreateReview {
  execute(cmd: CreateReviewCommand): Promise<ReviewModel>;
}
