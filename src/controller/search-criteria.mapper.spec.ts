import { SearchCriteriaMapper } from './search-criteria.mapper.js';
import { SubjectType } from '@model/subject-reference.js';
import { SortField, SortOrder } from '@model/search-criteria.js';
import type { SearchReviewQueryDto } from '@dto/search-review-query.dto.js';

describe('SearchCriteriaMapper', () => {
  it('should successfully map valid dto to SearchCriteria', () => {
    const dto: SearchReviewQueryDto = {
      page: 1,
      page_size: 10,
      content_contains: 'test',
      min_rating: 1,
      max_rating: 5,
      subject_type: SubjectType.ALBUM,
      sort_by: SortField.CREATED_AT,
      sort_order: SortOrder.DESC,
    };

    const criteria = SearchCriteriaMapper.fromDto(dto);

    expect(criteria.page).toBe(1);
    expect(criteria.pageSize).toBe(10);
    expect(criteria.content).toBe('test');
    expect(criteria.minRating).toBe(1);
    expect(criteria.maxRating).toBe(5);
    expect(criteria.subjectType).toBe(SubjectType.ALBUM);
    expect(criteria.sortBy).toBe(SortField.CREATED_AT);
    expect(criteria.sortOrder).toBe(SortOrder.DESC);
  });

  it('should pass through Date objects for date_from and date_to', () => {
    const dateFrom = new Date('2025-01-01');
    const dateTo = new Date('2025-06-01');
    const dto: SearchReviewQueryDto = {
      page: 1,
      page_size: 20,
      date_from: dateFrom,
      date_to: dateTo,
      sort_by: SortField.CREATED_AT,
      sort_order: SortOrder.DESC,
    };

    const criteria = SearchCriteriaMapper.fromDto(dto);

    expect(criteria.dateFrom).toBeInstanceOf(Date);
    expect(criteria.dateTo).toBeInstanceOf(Date);
    expect(criteria.dateFrom).toEqual(dateFrom);
    expect(criteria.dateTo).toEqual(dateTo);
  });

  it('should map minimal dto with only defaults', () => {
    const dto: SearchReviewQueryDto = {
      page: 1,
      page_size: 20,
      sort_by: SortField.CREATED_AT,
      sort_order: SortOrder.DESC,
    };

    const criteria = SearchCriteriaMapper.fromDto(dto);

    expect(criteria.page).toBe(1);
    expect(criteria.pageSize).toBe(20);
    expect(criteria.content).toBeUndefined();
    expect(criteria.authorId).toBeUndefined();
    expect(criteria.minRating).toBeUndefined();
    expect(criteria.maxRating).toBeUndefined();
    expect(criteria.dateFrom).toBeUndefined();
    expect(criteria.dateTo).toBeUndefined();
    expect(criteria.subjectType).toBeUndefined();
    expect(criteria.subjectId).toBeUndefined();
    expect(criteria.sortBy).toBe(SortField.CREATED_AT);
    expect(criteria.sortOrder).toBe(SortOrder.DESC);
  });

  it('should map all fields including subject and sort', () => {
    const dto: SearchReviewQueryDto = {
      page: 2,
      page_size: 50,
      content_contains: 'test',
      author_id: 5,
      min_rating: 1,
      max_rating: 5,
      date_from: new Date('2025-01-01'),
      date_to: new Date('2025-06-01'),
      subject_type: SubjectType.TRACK,
      subject_id: 10,
      sort_by: SortField.RATING,
      sort_order: SortOrder.ASC,
    };

    const criteria = SearchCriteriaMapper.fromDto(dto);

    expect(criteria.page).toBe(2);
    expect(criteria.pageSize).toBe(50);
    expect(criteria.content).toBe('test');
    expect(criteria.authorId).toBe(5);
    expect(criteria.minRating).toBe(1);
    expect(criteria.maxRating).toBe(5);
    expect(criteria.dateFrom).toBeInstanceOf(Date);
    expect(criteria.dateTo).toBeInstanceOf(Date);
    expect(criteria.subjectType).toBe(SubjectType.TRACK);
    expect(criteria.subjectId).toBe(10);
    expect(criteria.sortBy).toBe(SortField.RATING);
    expect(criteria.sortOrder).toBe(SortOrder.ASC);
  });
});
