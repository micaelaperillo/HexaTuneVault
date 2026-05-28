import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SearchCriteria, SortField, SortOrder } from './search-criteria.js';
import { SubjectType } from './subject-reference.js';

describe('SearchCriteria', () => {
  function validate(data: Partial<SearchCriteria>): string[] {
    const criteria = plainToInstance(SearchCriteria, data);
    const errors = validateSync(criteria);
    return errors.flatMap((e) => Object.values(e.constraints ?? {}));
  }

  it('should pass with defaults only', () => {
    expect(validate({})).toHaveLength(0);
  });

  it('should fail when page < 1', () => {
    const msgs = validate({ page: 0 });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when pageSize > 100', () => {
    const msgs = validate({ pageSize: 101 });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail when pageSize < 1', () => {
    const msgs = validate({ pageSize: 0 });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should pass when only minRating set', () => {
    expect(validate({ minRating: 3 })).toHaveLength(0);
  });

  it('should pass when only dateFrom set', () => {
    expect(validate({ dateFrom: new Date('2025-01-01') })).toHaveLength(0);
  });

  it('should pass when subjectId provided with subjectType', () => {
    expect(
      validate({ subjectId: 1, subjectType: SubjectType.ALBUM }),
    ).toHaveLength(0);
  });

  it('should pass when subjectType set without subjectId', () => {
    expect(validate({ subjectType: SubjectType.TRACK })).toHaveLength(0);
  });

  it('should accept valid sortBy and sortOrder', () => {
    expect(
      validate({ sortBy: SortField.RATING, sortOrder: SortOrder.ASC }),
    ).toHaveLength(0);
  });

  it('should fail with invalid sortBy value', () => {
    const msgs = validate({ sortBy: 'invalid' as SortField });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('should fail with invalid sortOrder value', () => {
    const msgs = validate({ sortOrder: 'invalid' as SortOrder });
    expect(msgs.length).toBeGreaterThan(0);
  });
});
