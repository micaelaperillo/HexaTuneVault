import { resolveSpotifyPage } from '../../../src/adapter/spotify-pagination';

describe('resolveSpotifyPage', () => {
  it('uses the provided page and pageSize when valid', () => {
    const result = resolveSpotifyPage({ page: 3, pageSize: 10 });

    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(10);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(20);
  });

  it('falls back to page 1 when page is missing or not positive', () => {
    expect(resolveSpotifyPage({}).page).toBe(1);
    expect(resolveSpotifyPage({ page: 0 }).page).toBe(1);
  });

  it('clamps pageSize to the Spotify maximum', () => {
    const result = resolveSpotifyPage({ page: 1, pageSize: 1000 });

    expect(result.pageSize).toBeLessThanOrEqual(50);
    expect(result.limit).toBe(result.pageSize);
  });
});
