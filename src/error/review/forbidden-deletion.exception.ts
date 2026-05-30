import { DomainException } from '@error/domain.exception.js';

export class ForbiddenDeletionException extends DomainException {
  constructor() {
    super('Not authorized to delete this review', 'FORBIDDEN_DELETION');
  }
}
