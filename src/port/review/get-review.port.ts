import type { ReviewModel } from '../../model/review.model';

export interface IGetReview {
  get(id: number): Promise<ReviewModel>;
}
