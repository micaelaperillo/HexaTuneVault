import type { PageableFilters } from './page.model';
import type { SubjectType } from './review-subject';

export const SortField = {
  CREATED_AT: 'createdAt',
  RATING: 'rating',
} as const;

export type SortField = (typeof SortField)[keyof typeof SortField];

export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

// A subject filter is all-or-nothing: a type is required before an id can
// narrow it.
export type SubjectFilter =
  | { subjectType?: undefined; subjectId?: undefined }
  | { subjectType: SubjectType; subjectId?: string };

export type ReviewFilters = PageableFilters & {
  content?: string;
  authorId?: number;
  minRating?: number;
  maxRating?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: SortField;
  sortOrder: SortOrder;
} & SubjectFilter;
