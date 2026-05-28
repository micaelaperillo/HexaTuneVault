import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SubjectType } from '@review/domain/model/subject-reference.js';

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
