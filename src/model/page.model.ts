export interface PageRequest {
  page: number;
  pageSize: number;
}

// Optional pagination that search filter types extend; adapters apply a
// sensible default when the caller omits these.
export interface PageableFilters {
  page?: number;
  pageSize?: number;
}

export interface Page<T> extends PageRequest {
  items: T[];
  /** Total number of matching items across all pages. */
  total: number;
}
