import type { Page } from '../model';
import type { ReviewModel } from '../model/review.model';
import type { SubjectReference } from '../model/subject-reference';
import type { ReviewSearchCriteria } from '../model/review-search-criteria';
import { UserModel } from '../model';

export const REVIEW_REPOSITORY = Symbol('IReviewRepository');

export interface IReviewRepository {
  save(review: ReviewModel): Promise<ReviewModel>;
  findById(id: number): Promise<ReviewModel | null>;
  findRecentByAuthorAndSubject(
    author: Pick<UserModel, 'id'>,
    ref: SubjectReference,
    since: Date,
  ): Promise<ReviewModel | null>;
  delete(id: number): Promise<void>;
  search(criteria: ReviewSearchCriteria): Promise<Page<ReviewModel>>;
}
