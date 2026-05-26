import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsDate,
  ValidatorConstraint,
  Validate,
} from 'class-validator';
import type {
  ValidatorConstraintInterface,
  ValidationArguments,
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

@ValidatorConstraint({ async: false })
class MaxRatingConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as SearchCriteria;
    if (obj.minRating === undefined || obj.maxRating === undefined) return true;
    return obj.minRating <= obj.maxRating;
  }
  defaultMessage(): string {
    return 'minRating must not exceed maxRating';
  }
}

@ValidatorConstraint({ async: false })
class DateRangeConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as SearchCriteria;
    if (!obj.dateFrom || !obj.dateTo) return true;
    return obj.dateFrom <= obj.dateTo;
  }
  defaultMessage(): string {
    return 'dateFrom must not be after dateTo';
  }
}

@ValidatorConstraint({ async: false })
class SubjectIdRequiresTypeConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as SearchCriteria;
    if (obj.subjectId === undefined) return true;
    return obj.subjectType !== undefined;
  }
  defaultMessage(): string {
    return 'subjectType is required when subjectId is provided';
  }
}

export class SearchCriteria {
  @IsInt() @Min(1) page: number = 1;
  @IsInt() @Min(1) @Max(100) pageSize: number = 20;
  @IsOptional() @IsString() @MaxLength(200) content?: string;
  @IsOptional() @IsInt() authorId?: number;
  @IsOptional() @IsInt() @Min(1) @Max(5) minRating?: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @Validate(MaxRatingConstraint)
  maxRating?: number;
  @IsOptional() @IsDate() dateFrom?: Date;
  @IsOptional() @IsDate() @Validate(DateRangeConstraint) dateTo?: Date;
  @IsOptional() @IsEnum(SubjectType) subjectType?: SubjectType;
  @IsOptional()
  @IsInt()
  @Validate(SubjectIdRequiresTypeConstraint)
  subjectId?: number;
  @IsOptional() @IsEnum(SortField) sortBy: SortField = SortField.CREATED_AT;
  @IsOptional() @IsEnum(SortOrder) sortOrder: SortOrder = SortOrder.DESC;
}
