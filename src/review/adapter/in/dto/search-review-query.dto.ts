import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  MaxLength,
  IsISO8601,
  IsEnum,
  ValidatorConstraint,
  Validate,
} from 'class-validator';
import type {
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortField, SortOrder } from '@review/domain/model/search-criteria.js';
import { SubjectType } from '@review/domain/model/subject-reference.js';

@ValidatorConstraint({ async: false })
class MaxRatingDtoConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as SearchReviewQueryDto;
    if (obj.min_rating === undefined || obj.max_rating === undefined)
      return true;
    return obj.min_rating <= obj.max_rating;
  }
  defaultMessage(): string {
    return 'min_rating must not exceed max_rating';
  }
}

@ValidatorConstraint({ async: false })
class DateRangeDtoConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as SearchReviewQueryDto;
    if (!obj.date_from || !obj.date_to) return true;
    return obj.date_from <= obj.date_to;
  }
  defaultMessage(): string {
    return 'date_from must not be after date_to';
  }
}

@ValidatorConstraint({ async: false })
class SubjectIdRequiresTypeDtoConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as SearchReviewQueryDto;
    if (obj.subject_id === undefined) return true;
    return obj.subject_type !== undefined;
  }
  defaultMessage(): string {
    return 'subject_type is required when subject_id is provided';
  }
}

export class SearchReviewQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  page_size: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  content?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  author_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  min_rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  @Validate(MaxRatingDtoConstraint)
  max_rating?: number;

  @IsOptional()
  @IsISO8601()
  date_from?: string;

  @IsOptional()
  @IsISO8601()
  @Validate(DateRangeDtoConstraint)
  date_to?: string;

  @IsOptional()
  @IsEnum(SubjectType)
  subject_type?: SubjectType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Validate(SubjectIdRequiresTypeDtoConstraint)
  subject_id?: number;

  @IsOptional()
  @IsEnum(SortField)
  sort_by?: SortField;

  @IsOptional()
  @IsEnum(SortOrder)
  sort_order?: SortOrder;
}
