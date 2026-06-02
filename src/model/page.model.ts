export type PageRequest = {
  page: number;
  pageSize: number;
};

// Optional pagination that search filter types extend; adapters apply a
// sensible default when the caller omits these.
export type PageableFilters = {
  page?: number;
  pageSize?: number;
};

export type Page<T> = PageRequest & {
  items: T[];
  /** Total number of matching items across all pages. */
  total: number;
};
