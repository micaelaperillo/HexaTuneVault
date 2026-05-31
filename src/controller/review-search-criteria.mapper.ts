import type { ReviewSearchCriteria } from '../model/review-search-criteria';
import type { SearchReviewQueryDto } from '../dto/search-review-query.dto';

export class ReviewSearchCriteriaMapper {
  static fromDto(dto: SearchReviewQueryDto): ReviewSearchCriteria {
    const base = {
      page: dto.page,
      pageSize: dto.page_size,
      content: dto.content_contains,
      authorId: dto.author_id,
      minRating: dto.min_rating,
      maxRating: dto.max_rating,
      dateFrom: dto.date_from,
      dateTo: dto.date_to,
      sortBy: dto.sort_by,
      sortOrder: dto.sort_order,
    };

    if (dto.subject_type !== undefined) {
      return {
        ...base,
        subjectType: dto.subject_type,
        subjectId: dto.subject_id,
      };
    }
    return { ...base, subjectType: undefined, subjectId: undefined };
  }
}
