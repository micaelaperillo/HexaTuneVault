import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PageQueryDto } from '../src/dto/page-query.dto';

describe('PageQueryDto', () => {
  it('applies defaults when query params are absent', () => {
    const dto = plainToInstance(PageQueryDto, {});

    expect(dto.page).toBe(1);
    expect(dto.page_size).toBe(20);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('coerces numeric strings from the query string', () => {
    const dto = plainToInstance(PageQueryDto, { page: '3', page_size: '50' });

    expect(dto.page).toBe(3);
    expect(dto.page_size).toBe(50);
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects page_size above the maximum', () => {
    const dto = plainToInstance(PageQueryDto, { page_size: '500' });

    expect(validateSync(dto).length).toBeGreaterThan(0);
  });

  it('rejects page below 1', () => {
    const dto = plainToInstance(PageQueryDto, { page: '0' });

    expect(validateSync(dto).length).toBeGreaterThan(0);
  });
});
