export interface DeleteReviewCommand {
  reviewId: number;
  requesterId: number;
}

export interface IDeleteReview {
  execute(cmd: DeleteReviewCommand): Promise<void>;
}
