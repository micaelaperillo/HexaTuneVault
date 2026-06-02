import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ArtistFilterDto } from '../../../src/dto/artist.filter';

describe('ArtistFilterDto (pagination defaults)', () => {
  function transform(data: Record<string, unknown>): ArtistFilterDto {
    return plainToInstance(ArtistFilterDto, data);
  }

  function validate(data: Record<string, unknown>): string[] {
    const dto = transform(data);
    const errors = validateSync(dto);
    return errors.flatMap((e) => Object.values(e.constraints ?? {}));
  }

  it('applies default page when not provided', () => {
    const dto = transform({ q: 'Beatles' });
    expect(dto.page).toBe(1);
  });

  it('applies default page_size when not provided', () => {
    const dto = transform({ q: 'Beatles' });
    expect(dto.page_size).toBe(10);
  });

  it('coerces page from numeric input', () => {
    const dto = transform({ q: 'Beatles', page: 2 });
    expect(dto.page).toBe(2);
  });

  it('coerces page_size from numeric input', () => {
    const dto = transform({ q: 'Beatles', page_size: 25 });
    expect(dto.page_size).toBe(25);
  });

  it('wraps a single genre string into an array', () => {
    const dto = transform({ q: 'Beatles', genre: 'Rock' });
    expect(dto.genre).toEqual(['Rock']);
  });

  it('passes validation with page and page_size', () => {
    expect(validate({ q: 'Beatles', page: 2, page_size: 20 })).toHaveLength(0);
  });

  it('fails when page_size exceeds 50', () => {
    expect(validate({ q: 'Beatles', page_size: 51 }).length).toBeGreaterThan(0);
  });
});
