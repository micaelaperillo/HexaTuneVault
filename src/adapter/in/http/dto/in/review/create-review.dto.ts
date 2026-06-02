import { IsString, Length, IsInt, Min, Max, Validate } from 'class-validator';
import { TrimString } from '../../transforms';
import {
  type ReviewSubject,
  RATING_MIN,
  RATING_MAX,
  CONTENT_MIN_LENGTH,
  CONTENT_MAX_LENGTH,
} from '../../../../../../model/review';
import { IsReviewSubjectConstraint } from '../../validators/is-review-subject.validator';

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
