import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { AlbumSearchDto } from '../../../src/dto/album.search';

describe('AlbumSearchDto', () => {
  function validate(data: Record<string, unknown>): string[] {
    const dto = plainToInstance(AlbumSearchDto, data);
    const errors = validateSync(dto);
    return errors.flatMap((e) => Object.values(e.constraints ?? {}));
  }

  it('fails when no q, artist or year is provided', () => {
    const msgs = validate({ page: 1, page_size: 10 });
    expect(msgs.length).toBeGreaterThan(0);
  });

  it('fails when filters are omitted entirely (defaults apply)', () => {
    expect(validate({}).length).toBeGreaterThan(0);
  });

  it('passes with a q filter', () => {
    expect(validate({ q: 'Abbey Road' })).toHaveLength(0);
  });

  it('passes with an artist filter', () => {
    expect(validate({ artist: 'The Beatles' })).toHaveLength(0);
  });

  it('passes with a year filter', () => {
    expect(validate({ year: 1969 })).toHaveLength(0);
  });
});
