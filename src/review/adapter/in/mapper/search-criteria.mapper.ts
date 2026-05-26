import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SearchCriteria } from '@review/domain/model/search-criteria.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';
import type { SearchReviewQueryDto } from '../dto/search-review-query.dto.js';

export class SearchCriteriaMapper {
  static fromDto(dto: SearchReviewQueryDto): SearchCriteria {
    const data = {
      page: dto.page,
      pageSize: dto.page_size,
      content: dto.content,
      authorId: dto.author_id,
      minRating: dto.min_rating,
      maxRating: dto.max_rating,
      dateFrom: dto.date_from ? new Date(dto.date_from) : undefined,
      dateTo: dto.date_to ? new Date(dto.date_to) : undefined,
      subjectType: dto.subject_type,
      subjectId: dto.subject_id,
      sortBy: dto.sort_by,
      sortOrder: dto.sort_order,
    };

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
