export const UNLIKE_REVIEW = Symbol('IUnlikeReview');

export interface IUnlikeReview {
  unlike(reviewId: number, userId: number): Promise<void>;
}
