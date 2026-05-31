import { Injectable, Inject } from '@nestjs/common';
import type { ISearchReview } from '../port/review/search-review.port';
import type { IReviewRepository } from '../repository/review-repository.port';
import type { PaginatedResult } from '../common/paginated-result';
import type { ReviewModel } from '../model/review.model';
import type { ReviewSearchCriteria } from '../model/review-search-criteria';
import { REVIEW_REPOSITORY } from '../port/review/tokens';

@Injectable()
export class SearchReviewService implements ISearchReview {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
  ) {}

  async execute(
    criteria: ReviewSearchCriteria,
  ): Promise<PaginatedResult<ReviewModel>> {
    return this.repo.search(criteria);
  }
}
