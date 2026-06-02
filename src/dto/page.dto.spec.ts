import { PageDto } from './page.dto';

describe('PageDto.of', () => {
  it('wraps items with the page metadata', () => {
    const page = PageDto.of(['a', 'b'], { page: 2, pageSize: 20 }, 41);

    expect(page).toEqual({
      items: ['a', 'b'],
      page: 2,
      pageSize: 20,
      total: 41,
    });
  });

  it('preserves an empty page', () => {
    const page = PageDto.of([], { page: 1, pageSize: 20 }, 0);

    expect(page).toEqual({ items: [], page: 1, pageSize: 20, total: 0 });
  });
});
