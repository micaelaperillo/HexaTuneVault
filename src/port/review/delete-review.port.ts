import { UserModel } from '../../model';

export interface DeleteReviewCommand {
  reviewId: number;
  requesterId: Pick<UserModel, 'id'>;
}

export interface IDeleteReview {
  execute(cmd: DeleteReviewCommand): Promise<void>;
}
