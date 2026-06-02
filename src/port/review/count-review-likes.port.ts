export interface ICountReviewLikes {
  count(reviewId: number): Promise<number>;
}
