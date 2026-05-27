import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SearchCriteria } from '@review/domain/model/search-criteria.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';
import type { SearchReviewQueryDto } from '../dto/search-review-query.dto.js';

export class SearchCriteriaMapper {
  static fromDto(dto: SearchReviewQueryDto): SearchCriteria {
    const data: Record<string, unknown> = {
      page: dto.page,
      pageSize: dto.page_size,
    };

    if (dto.content !== undefined) data.content = dto.content;
    if (dto.author_id !== undefined) data.authorId = dto.author_id;
    if (dto.min_rating !== undefined) data.minRating = dto.min_rating;
    if (dto.max_rating !== undefined) data.maxRating = dto.max_rating;
    if (dto.date_from) data.dateFrom = new Date(dto.date_from);
    if (dto.date_to) data.dateTo = new Date(dto.date_to);
    if (dto.subject_type !== undefined) data.subjectType = dto.subject_type;
    if (dto.subject_id !== undefined) data.subjectId = dto.subject_id;
    if (dto.sort_by !== undefined) data.sortBy = dto.sort_by;
    if (dto.sort_order !== undefined) data.sortOrder = dto.sort_order;

    const criteria = plainToInstance(SearchCriteria, data);
    const errors = validateSync(criteria);
    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );
      throw new InvalidReviewException(messages.join('; '));
    }

    return criteria;
  }
}
