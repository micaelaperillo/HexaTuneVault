import type { ReviewModel } from '@model/review.model.js';

export interface IGetReview {
  execute(id: number): Promise<ReviewModel>;
}
