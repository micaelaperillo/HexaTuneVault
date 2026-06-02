import { ValidatorConstraint } from 'class-validator';
import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import type { ReviewSearchDto } from '../in/review/review-search.dto';

@ValidatorConstraint({ async: false })
export class MaxRatingDtoConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as ReviewSearchDto;
    if (obj.min_rating === undefined || obj.max_rating === undefined)
      return true;
    return obj.min_rating <= obj.max_rating;
  }

  defaultMessage(): string {
    return 'min_rating must not exceed max_rating';
  }
}
