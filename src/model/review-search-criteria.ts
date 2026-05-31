import type { SubjectType } from './subject-reference';

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

export type SubjectFilter =
  | { subjectType?: undefined; subjectId?: undefined }
  | { subjectType: SubjectType; subjectId?: string };

export type ReviewSearchCriteria = {
  page: number;
  pageSize: number;
  content?: string;
  authorId?: string;
  minRating?: number;
  maxRating?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: SortField;
  sortOrder: SortOrder;
} & SubjectFilter;
