import { Injectable, Inject } from '@nestjs/common';
import type { ISearchReview } from '@review/port/in/search-review.port.js';
import type { IReviewRepository } from '@review/port/out/review-repository.port.js';
import type { PaginatedResult } from '@review/port/paginated-result.js';
import type { ReviewModel } from '@review/domain/model/review.model.js';
import type { SearchCriteria } from '@review/port/search-criteria.js';
import { REVIEW_REPOSITORY } from '@review/port/tokens.js';

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
