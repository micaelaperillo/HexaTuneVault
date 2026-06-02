import type { ReviewModel } from '../../../model/review';

export const GET_REVIEW = Symbol('IGetReview');

export interface IGetReview {
  get(id: number): Promise<ReviewModel>;
}
