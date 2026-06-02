export interface IReviewLikeRepository {
  addLike(reviewId: number, userId: string): Promise<void>;
  removeLike(reviewId: number, userId: string): Promise<boolean>;
  countLikes(reviewId: number): Promise<number>;
}
