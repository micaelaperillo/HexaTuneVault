import { ValidatorConstraint } from 'class-validator';
import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import type { ReviewFilterDto } from '../in/review/review-filter.dto';

@ValidatorConstraint({ async: false })
export class DateRangeDtoConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as ReviewFilterDto;
    if (!obj.date_from || !obj.date_to) return true;
    return obj.date_from.getTime() <= obj.date_to.getTime();
  }

  defaultMessage(): string {
    return 'date_from must not be after date_to';
  }
}
