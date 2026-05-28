import type { ReviewModel } from '@review/domain/model/review.model.js';

export interface IGetReview {
  execute(id: number): Promise<ReviewModel>;
}
