import { SearchCriteria } from '@review/domain/model/search-criteria.js';
import type { SearchReviewQueryDto } from '../dto/search-review-query.dto.js';

export class SearchCriteriaMapper {
  static fromDto(dto: SearchReviewQueryDto): SearchCriteria {
    const criteria = new SearchCriteria();
    criteria.page = dto.page;
    criteria.pageSize = dto.page_size;
    if (dto.content !== undefined) criteria.content = dto.content;
    if (dto.author_id !== undefined) criteria.authorId = dto.author_id;
    if (dto.min_rating !== undefined) criteria.minRating = dto.min_rating;
    if (dto.max_rating !== undefined) criteria.maxRating = dto.max_rating;
    if (dto.date_from !== undefined) criteria.dateFrom = dto.date_from;
    if (dto.date_to !== undefined) criteria.dateTo = dto.date_to;
    if (dto.subject_type !== undefined) criteria.subjectType = dto.subject_type;
    if (dto.subject_id !== undefined) criteria.subjectId = dto.subject_id;
    if (dto.sort_by !== undefined) criteria.sortBy = dto.sort_by;
    if (dto.sort_order !== undefined) criteria.sortOrder = dto.sort_order;
    return criteria;
  }
}
