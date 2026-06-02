export const HAS_LIKED_REVIEW = Symbol('IHasLikedReview');

export interface IHasLikedReview {
  /**
   * Reports whether the given user has liked the given review. Absence-tolerant:
   * returns `false` for a non-existent review rather than distinguishing it.
   */
  hasLiked(reviewId: number, userId: number): Promise<boolean>;
}
