import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  MaxLength,
  IsDate,
  IsEnum,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SortField, SortOrder } from '../model/review-filter.model';
import { SubjectType } from '../model/review-subject';
import { RATING_MIN, RATING_MAX } from '../model/review-constraints';
import { MaxRatingDtoConstraint } from './validators/max-rating.validator';
import { DateRangeDtoConstraint } from './validators/date-range.validator';
import { SubjectIdRequiresTypeDtoConstraint } from './validators/subject-id-requires-type.validator';

export class ReviewFilterDto {
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
  @Type(() => Number)
  @IsInt()
  @Min(1)
  author_id?: number;

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
