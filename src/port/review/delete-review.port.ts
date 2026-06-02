export interface DeleteReviewCommand {
  reviewId: number;
  requesterId: string;
}

export interface IDeleteReview {
  delete(cmd: DeleteReviewCommand): Promise<void>;
}
