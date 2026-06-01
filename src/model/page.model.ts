export interface PageRequest {
  page: number;
  pageSize: number;
}

export interface Page<T> extends PageRequest {
  items: T[];
  /** Total number of matching items across all pages. */
  total: number;
}
