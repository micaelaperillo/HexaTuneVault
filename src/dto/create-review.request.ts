import {
  IsString,
  IsNotEmpty,
  Length,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SubjectType } from '../model/subject-reference';
import {
  RATING_MIN,
  RATING_MAX,
  CONTENT_MIN_LENGTH,
  CONTENT_MAX_LENGTH,
} from '../model/review-constraints';

export class CreateReviewRequest {
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @Length(CONTENT_MIN_LENGTH, CONTENT_MAX_LENGTH)
  content!: string;

  @IsEnum(SubjectType)
  subject_type!: SubjectType;

  @IsString()
  @IsNotEmpty()
  subject_id!: string;

  @IsInt()
  @Min(RATING_MIN)
  @Max(RATING_MAX)
  rating!: number;
}
