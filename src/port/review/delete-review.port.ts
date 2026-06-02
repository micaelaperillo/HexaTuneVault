import { UserModel } from '../../model';

export interface DeleteReviewCommand {
  reviewId: number;
  requesterId: Pick<UserModel, 'id'>;
}

export const DELETE_REVIEW = Symbol('IDeleteReview');

export interface IDeleteReview {
  delete(cmd: DeleteReviewCommand): Promise<void>;
}
