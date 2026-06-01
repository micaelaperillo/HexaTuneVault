import { DomainException } from '../domain.exception';

export class ForbiddenDeletionException extends DomainException {
  constructor() {
    super('Not authorized to delete this review', 'FORBIDDEN_DELETION');
  }
}
