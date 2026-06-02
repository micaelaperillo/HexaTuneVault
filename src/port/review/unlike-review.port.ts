export interface IUnlikeReview {
  unlike(reviewId: number, userId: string): Promise<void>;
}
