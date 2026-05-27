import { SearchCriteriaMapper } from './search-criteria.mapper.js';
import { InvalidReviewException } from '@review/domain/exception/invalid-review.exception.js';
import { SubjectType } from '@review/domain/model/subject-reference.js';
import { SortField, SortOrder } from '@review/domain/model/search-criteria.js';

describe('SearchCriteriaMapper', () => {
  it('should successfully map valid dto to SearchCriteria', () => {
    const dto = {
      page: 1,
      page_size: 10,
      content: 'test',
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

  it('should throw InvalidReviewException on validation error', () => {
    const dto = {
      page: -1,
      page_size: 10,
    };

    expect(() => SearchCriteriaMapper.fromDto(dto)).toThrow(
      InvalidReviewException,
    );
  });

  it('should convert date strings to Date objects', () => {
    const dto = {
      page: 1,
      page_size: 20,
      date_from: '2025-01-01',
      date_to: '2025-06-01',
    };

    const criteria = SearchCriteriaMapper.fromDto(dto);

    expect(criteria.dateFrom).toBeInstanceOf(Date);
    expect(criteria.dateTo).toBeInstanceOf(Date);
  });

  it('should map minimal dto with only defaults', () => {
    const dto = { page: 1, page_size: 20 };

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
    const dto = {
      page: 2,
      page_size: 50,
      content: 'test',
      author_id: 5,
      min_rating: 1,
      max_rating: 5,
      date_from: '2025-01-01',
      date_to: '2025-06-01',
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
    expect(criteria.subjectType).toBe(SubjectType.TRACK);
    expect(criteria.subjectId).toBe(10);
    expect(criteria.sortBy).toBe(SortField.RATING);
    expect(criteria.sortOrder).toBe(SortOrder.ASC);
  });
});
