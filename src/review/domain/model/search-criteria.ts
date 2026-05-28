import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsDate,
} from 'class-validator';
import { SubjectType } from './subject-reference.js';

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

export class SearchCriteria {
  @IsInt() @Min(1) page: number = 1;
  @IsInt() @Min(1) @Max(100) pageSize: number = 20;
  @IsOptional() @IsString() @MaxLength(200) content?: string;
  @IsOptional() @IsInt() authorId?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) minRating?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) maxRating?: number;
  @IsOptional() @IsDate() dateFrom?: Date;
  @IsOptional() @IsDate() dateTo?: Date;
  @IsOptional() @IsEnum(SubjectType) subjectType?: SubjectType;
  @IsOptional() @IsInt() subjectId?: number;
  @IsOptional() @IsEnum(SortField) sortBy: SortField = SortField.CREATED_AT;
  @IsOptional() @IsEnum(SortOrder) sortOrder: SortOrder = SortOrder.DESC;
}
