import { ValidatorConstraint } from 'class-validator';
import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';
import type { ReviewFilterDto } from '../review-filter.dto';

@ValidatorConstraint({ async: false })
export class SubjectIdRequiresTypeDtoConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as ReviewFilterDto;
    if (obj.subject_id === undefined) return true;
    return obj.subject_type !== undefined;
  }

  defaultMessage(): string {
    return 'subject_type is required when subject_id is provided';
  }
}
