export const REVIEW_LIKE_REPOSITORY = Symbol('IReviewLikeRepository');

export interface IReviewLikeRepository {
  addLike(reviewId: number, userId: number): Promise<void>;
  removeLike(reviewId: number, userId: number): Promise<boolean>;
  countLikes(reviewId: number): Promise<number>;
}
