import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { SearchReviewQueryDto } from './search-review-query.dto.js';
import { SubjectType } from '@review/domain/model/subject-reference.js';
import { SortField, SortOrder } from '@review/port/search-criteria.js';

describe('SearchReviewQueryDto', () => {
  function validate(data: Record<string, unknown>): string[] {
    const dto = plainToInstance(SearchReviewQueryDto, data);
    const errors = validateSync(dto);
    return errors.flatMap((e) => Object.values(e.constraints ?? {}));
  }

  it('should pass with defaults (empty input)', () => {
    expect(validate({})).toHaveLength(0);
  });

  it('should pass with all valid fields', () => {
    expect(
      validate({
        page: 1,
        page_size: 50,
        content: 'test',
        author_id: 5,
        min_rating: 1,
        max_rating: 5,
        date_from: new Date('2025-01-01'),
        date_to: new Date('2025-06-01'),
        subject_type: SubjectType.ALBUM,
        subject_id: 10,
        sort_by: SortField.RATING,
        sort_order: SortOrder.ASC,
      }),
    ).toHaveLength(0);
  });

  it('should fail when min_rating > max_rating', () => {
    const msgs = validate({ min_rating: 5, max_rating: 1 });
    expect(
      msgs.some((m) => m.includes('min_rating must not exceed max_rating')),
    ).toBe(true);
  });

  it('should pass when only min_rating set', () => {
    expect(validate({ min_rating: 3 })).toHaveLength(0);
  });

  it('should pass when only max_rating set', () => {
    expect(validate({ max_rating: 4 })).toHaveLength(0);
  });

  it('should fail when date_from > date_to', () => {
    const msgs = validate({
      date_from: new Date('2025-06-01'),
      date_to: new Date('2025-01-01'),
    });
    expect(
      msgs.some((m) => m.includes('date_from must not be after date_to')),
    ).toBe(true);
  });

  it('should pass when only date_from set', () => {
    expect(validate({ date_from: new Date('2025-01-01') })).toHaveLength(0);
  });

  it('should pass when only date_to set', () => {
    expect(validate({ date_to: new Date('2025-06-01') })).toHaveLength(0);
  });

  it('should fail when subject_id provided without subject_type', () => {
    const msgs = validate({ subject_id: 1 });
    expect(msgs.some((m) => m.includes('subject_type is required'))).toBe(true);
  });

  it('should pass when subject_id and subject_type both provided', () => {
    expect(
      validate({ subject_id: 1, subject_type: SubjectType.TRACK }),
    ).toHaveLength(0);
  });

  it('should fail when page < 1', () => {
    expect(validate({ page: 0 }).length).toBeGreaterThan(0);
  });

  it('should fail when page_size > 100', () => {
    expect(validate({ page_size: 101 }).length).toBeGreaterThan(0);
  });

  it('should fail with invalid subject_type', () => {
    expect(validate({ subject_type: 'invalid' }).length).toBeGreaterThan(0);
  });

  it('should fail with invalid sort_by', () => {
    expect(validate({ sort_by: 'invalid' }).length).toBeGreaterThan(0);
  });

  it('should fail with invalid sort_order', () => {
    expect(validate({ sort_order: 'invalid' }).length).toBeGreaterThan(0);
  });
});
