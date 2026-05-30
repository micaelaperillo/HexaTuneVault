import type { SubjectType } from '@model/subject-reference.js';

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
  | { subjectType: SubjectType; subjectId?: number };

export type SearchCriteria = {
  page: number;
  pageSize: number;
  content?: string;
  authorId?: number;
  minRating?: number;
  maxRating?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: SortField;
  sortOrder: SortOrder;
} & SubjectFilter;
