import type { UserModel } from '../../../model';
import type { ReviewModel } from '../../../model/review';

export type CreateReviewCommand = Omit<
  ReviewModel,
  'id' | 'createdAt' | 'updatedAt' | 'author'
> & { author: Pick<UserModel, 'id'> };

export const CREATE_REVIEW = Symbol('ICreateReview');

export interface ICreateReview {
  create(cmd: CreateReviewCommand): Promise<ReviewModel>;
}
