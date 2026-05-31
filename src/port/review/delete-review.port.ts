export interface DeleteReviewCommand {
  reviewId: number;
  requesterId: string;
}

export interface IDeleteReview {
  execute(cmd: DeleteReviewCommand): Promise<void>;
}
