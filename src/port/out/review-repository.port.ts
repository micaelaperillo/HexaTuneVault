import type { Page, UserModel } from '../../model';
import type {
  ReviewModel,
  ReviewSubject,
  ReviewFilters,
} from '../../model/review';

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
