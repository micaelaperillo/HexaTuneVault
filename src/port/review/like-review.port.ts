export interface ILikeReview {
  execute(reviewId: number, userId: string): Promise<void>;
}
