export const LIKE_REVIEW = Symbol('ILikeReview');

export interface ILikeReview {
  like(reviewId: number, userId: string): Promise<void>;
}
