import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { PodcastFilterDto } from '../../../src/dto/podcast.filter';

describe('PodcastFilterDto', () => {
  function transform(data: Record<string, unknown>): PodcastFilterDto {
    return plainToInstance(PodcastFilterDto, data);
  }

  function validate(data: Record<string, unknown>): string[] {
    const dto = transform(data);
    const errors = validateSync(dto);
    return errors.flatMap((e) => Object.values(e.constraints ?? {}));
  }

  it('applies default page and page_size when not provided', () => {
    const dto = transform({ q: 'true crime' });
    expect(dto.page).toBe(1);
    expect(dto.page_size).toBe(10);
  });

  it('coerces page and page_size from numeric input', () => {
    const dto = transform({ q: 'true crime', page: 3, page_size: 25 });
    expect(dto.page).toBe(3);
    expect(dto.page_size).toBe(25);
  });

  it('trims q via @TrimString', () => {
    const dto = transform({ q: '  true crime  ' });
    expect(dto.q).toBe('true crime');
  });

  it('trims media_type via @TrimString', () => {
    const dto = transform({ q: 'x', media_type: '  audio  ' });
    expect(dto.media_type).toBe('audio');
  });

  it('trims market via @TrimString', () => {
    const dto = transform({ q: 'x', market: '  US  ' });
    expect(dto.market).toBe('US');
  });

  it('passes validation with q only', () => {
    expect(validate({ q: 'true crime' })).toHaveLength(0);
  });

  it('passes validation with all optional fields', () => {
    expect(
      validate({
        q: 'true crime',
        explicit: 'true',
        media_type: 'audio',
        market: 'US',
        page: 1,
        page_size: 10,
      }),
    ).toHaveLength(0);
  });

  it('fails when q is missing', () => {
    expect(validate({}).length).toBeGreaterThan(0);
  });

  it('fails when q is empty', () => {
    expect(validate({ q: '' }).length).toBeGreaterThan(0);
  });

  it('fails when page_size exceeds 50', () => {
    expect(validate({ q: 'x', page_size: 51 }).length).toBeGreaterThan(0);
  });
});
