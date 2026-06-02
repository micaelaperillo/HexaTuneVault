export class ReviewLikeCountResponse {
  review_id!: number;
  count!: number;

  static fromCount(reviewId: number, count: number): ReviewLikeCountResponse {
    const response = new ReviewLikeCountResponse();
    response.review_id = reviewId;
    response.count = count;
    return response;
  }
}
