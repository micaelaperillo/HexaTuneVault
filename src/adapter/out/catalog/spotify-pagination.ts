import type { IntClosedRange } from 'type-fest';

import type { PageableFilters } from '../../../model';

// Spotify caps a single search request at 50 items.
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;

// The Spotify SDK types the search `limit` as MaxInt<50> (0..50). After
// clamping, pageSize is always within 1..50, so this is the precise type the
// SDK accepts — exposing it here removes the per-call cast at every provider.
export type SpotifyLimit = IntClosedRange<1, typeof MAX_PAGE_SIZE>;

export interface ResolvedPage {
  page: number;
  pageSize: number;
  limit: SpotifyLimit;
  offset: number;
}

// Normalises optional page/pageSize from filters into the limit/offset the
// Spotify SDK expects, clamped to Spotify's per-request maximum.
export function resolveSpotifyPage(filters: PageableFilters): ResolvedPage {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const requested = filters.pageSize ?? DEFAULT_PAGE_SIZE;
  // Clamped to [1, MAX_PAGE_SIZE]; the literal-union type can't be inferred
  // from a runtime number, so the single sound cast lives here.
  const pageSize = Math.min(
    Math.max(requested, 1),
    MAX_PAGE_SIZE,
  ) as SpotifyLimit;
  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}
