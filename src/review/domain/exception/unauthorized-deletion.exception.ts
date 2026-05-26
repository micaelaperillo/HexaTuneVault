import { DomainException } from './domain.exception.js';

export class UnauthorizedDeletionException extends DomainException {
  constructor() {
    super('Not authorized to delete this review', 'UNAUTHORIZED_DELETION');
  }
}
