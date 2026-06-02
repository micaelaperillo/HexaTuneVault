export interface IReviewLikeRepository {
  addLike(reviewId: number, userId: string): Promise<void>;
  removeLike(reviewId: number, userId: string): Promise<boolean>;
}
