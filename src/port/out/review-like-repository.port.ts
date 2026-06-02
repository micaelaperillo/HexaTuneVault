export const REVIEW_LIKE_REPOSITORY = Symbol('IReviewLikeRepository');

export interface IReviewLikeRepository {
  /** Idempotent: a second like by the same user is a no-op. */
  addLike(reviewId: number, userId: number): Promise<void>;
  /** Idempotent: removing an absent like is a no-op. */
  removeLike(reviewId: number, userId: number): Promise<void>;
  countLikes(reviewId: number): Promise<number>;
  /** Reports whether `userId` has liked the review. */
  hasLike(reviewId: number, userId: number): Promise<boolean>;
}
