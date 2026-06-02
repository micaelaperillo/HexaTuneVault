import type { Page } from '../model';
import type { ReviewModel } from '../model/review.model';
import type { ReviewSubject } from '../model/review-subject';
import type { ReviewFilters } from '../model/review.filter';
import type { UserModel } from '../model';

export const REVIEW_REPOSITORY = Symbol('IReviewRepository');

export interface IReviewRepository {
  create(
    review: Omit<ReviewModel, 'id' | 'createdAt' | 'updatedAt' | 'author'> & {
      author: Pick<UserModel, 'id'>;
    },
  ): Promise<ReviewModel>;
  findById(id: number): Promise<ReviewModel | null>;
  findRecentByAuthorAndSubject(
    author: Pick<UserModel, 'id'>,
    subject: ReviewSubject,
    since: Date,
  ): Promise<ReviewModel | null>;
  delete(id: number): Promise<void>;
  search(filters: ReviewFilters): Promise<Page<ReviewModel>>;
}
