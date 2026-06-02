export const COUNT_REVIEW_LIKES = Symbol('ICountReviewLikes');

export interface ICountReviewLikes {
  count(reviewId: number): Promise<number>;
}
