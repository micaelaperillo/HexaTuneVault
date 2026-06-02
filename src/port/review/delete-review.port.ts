export interface DeleteReviewCommand {
  reviewId: number;
  requesterId: string;
}

export const DELETE_REVIEW = Symbol('IDeleteReview');

export interface IDeleteReview {
  delete(cmd: DeleteReviewCommand): Promise<void>;
}
