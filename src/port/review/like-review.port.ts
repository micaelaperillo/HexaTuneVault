export interface ILikeReview {
  like(reviewId: number, userId: string): Promise<void>;
}
