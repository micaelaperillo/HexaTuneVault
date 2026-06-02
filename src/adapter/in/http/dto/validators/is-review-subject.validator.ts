import { ValidatorConstraint } from 'class-validator';
import type { ValidatorConstraintInterface } from 'class-validator';
import { SubjectType } from '../../../../../model/review-subject';

@ValidatorConstraint({ name: 'isReviewSubject', async: false })
export class IsReviewSubjectConstraint implements ValidatorConstraintInterface {
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
