export interface IUnlikeReview {
  execute(reviewId: number, userId: string): Promise<void>;
}
