import { Injectable, Inject } from '@nestjs/common';
import type { ISearchReview } from '@port/review/search-review.port.js';
import type { IReviewRepository } from '@repository/review-repository.port.js';
import type { PaginatedResult } from '@port/paginated-result.js';
import type { ReviewModel } from '@model/review.model.js';
import type { SearchCriteria } from '@model/search-criteria.js';
import { REVIEW_REPOSITORY } from '@port/review/tokens.js';

@Injectable()
export class SearchReviewService implements ISearchReview {
  constructor(
    @Inject(REVIEW_REPOSITORY) private readonly repo: IReviewRepository,
  ) {}

  async execute(
    criteria: SearchCriteria,
  ): Promise<PaginatedResult<ReviewModel>> {
    return this.repo.search(criteria);
  }
}
