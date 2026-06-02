import type { PageableFilters } from '../model/page.model';

// Spotify caps a single search request at 50 items.
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

export interface ResolvedPage {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

// Normalises optional page/pageSize from filters into the limit/offset the
// Spotify SDK expects, clamped to Spotify's per-request maximum.
export function resolveSpotifyPage(filters: PageableFilters): ResolvedPage {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const requested = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(requested, 1), MAX_PAGE_SIZE);
  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}
