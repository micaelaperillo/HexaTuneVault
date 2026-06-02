import {
  IsString,
  Length,
  IsInt,
  Min,
  Max,
  Validate,
  ValidatorConstraint,
} from 'class-validator';
import type { ValidatorConstraintInterface } from 'class-validator';
import { TrimString } from './transforms';
import { SubjectType } from '../model/review-subject';
import type { ReviewSubject } from '../model/review-subject';
import {
  RATING_MIN,
  RATING_MAX,
  CONTENT_MIN_LENGTH,
  CONTENT_MAX_LENGTH,
} from '../model/review-constraints';

@ValidatorConstraint({ name: 'isReviewSubject', async: false })
class IsReviewSubjectConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'object' || value === null) return false;
    const entries = Object.entries(value);
    if (entries.length !== 1) return false;
    const [[key, id]] = entries;
    const types: string[] = Object.values(SubjectType);
    return (
      types.includes(key) && typeof id === 'string' && id.trim().length > 0
    );
  }

  defaultMessage(): string {
    return 'subject must be exactly one of { album | artist | podcast | track } mapping to a non-empty id';
  }
}

export class CreateReviewDto {
  @IsString()
  @TrimString()
  @Length(CONTENT_MIN_LENGTH, CONTENT_MAX_LENGTH)
  content!: string;

  @Validate(IsReviewSubjectConstraint)
  subject!: ReviewSubject;

  @IsInt()
  @Min(RATING_MIN)
  @Max(RATING_MAX)
  rating!: number;
}
