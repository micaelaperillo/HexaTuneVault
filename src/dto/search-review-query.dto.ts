import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  MaxLength,
  IsDate,
  IsEnum,
  ValidatorConstraint,
  Validate,
} from 'class-validator';
import type {
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortField, SortOrder } from '../model/search-criteria';
import { SubjectType } from '../model/subject-reference';
import { RATING_MIN, RATING_MAX } from '../model/review-constraints';

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
    return obj.date_from.getTime() <= obj.date_to.getTime();
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
  content_contains?: string;

  @IsOptional()
  @IsString()
  author_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(RATING_MIN)
  @Max(RATING_MAX)
  min_rating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(RATING_MIN)
  @Max(RATING_MAX)
  @Validate(MaxRatingDtoConstraint)
  max_rating?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date_from?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @Validate(DateRangeDtoConstraint)
  date_to?: Date;

  @IsOptional()
  @IsEnum(SubjectType)
  subject_type?: SubjectType;

  @IsOptional()
  @IsString()
  @Validate(SubjectIdRequiresTypeDtoConstraint)
  subject_id?: string;

  @IsOptional()
  @IsEnum(SortField)
  sort_by: SortField = SortField.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sort_order: SortOrder = SortOrder.DESC;
}
