import type { ReviewModel } from '../../model/review.model';

export interface IGetReview {
  execute(id: number): Promise<ReviewModel>;
}
