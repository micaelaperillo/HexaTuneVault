import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AlbumFilterDto } from '../src/dto/album.filter';

describe('AlbumFilterDto', () => {
  function transform(data: Record<string, unknown>): AlbumFilterDto {
    return plainToInstance(AlbumFilterDto, data);
  }

  function validate(data: Record<string, unknown>): string[] {
    const dto = transform(data);
    const errors = validateSync(dto);
    return errors.flatMap((e) => Object.values(e.constraints ?? {}));
  }

  it('applies default page and page_size when not provided', () => {
    const dto = transform({ q: 'Abbey Road' });
    expect(dto.page).toBe(1);
    expect(dto.page_size).toBe(10);
  });

  it('coerces page and page_size from numeric input', () => {
    const dto = transform({ q: 'Abbey Road', page: 2, page_size: 20 });
    expect(dto.page).toBe(2);
    expect(dto.page_size).toBe(20);
  });

  it('trims q via @TrimString', () => {
    const dto = transform({ q: '  Abbey Road  ' });
    expect(dto.q).toBe('Abbey Road');
  });

  it('trims artist via @TrimString', () => {
    const dto = transform({ q: 'road', artist: '  Beatles  ' });
    expect(dto.artist).toBe('Beatles');
  });

  it('coerces year via @Transform(Number)', () => {
    const dto = transform({ year: '1969' });
    expect(dto.year).toBe(1969);
  });

  it('passes validation with q only', () => {
    expect(validate({ q: 'Abbey Road' })).toHaveLength(0);
  });

  it('passes validation with artist only', () => {
    expect(validate({ artist: 'Beatles' })).toHaveLength(0);
  });

  it('passes validation with year only', () => {
    expect(validate({ year: 1969 })).toHaveLength(0);
  });

  it('passes validation with all optional fields', () => {
    expect(
      validate({
        q: 'Abbey Road',
        artist: 'Beatles',
        year: 1969,
        page: 1,
        page_size: 10,
      }),
    ).toHaveLength(0);
  });

  it('fails when page_size exceeds 50', () => {
    expect(validate({ q: 'x', page_size: 51 }).length).toBeGreaterThan(0);
  });

  it('fails when year is negative', () => {
    expect(validate({ q: 'x', year: -1 }).length).toBeGreaterThan(0);
  });
});
