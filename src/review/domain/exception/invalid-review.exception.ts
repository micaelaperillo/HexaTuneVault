import { DomainException } from './domain.exception.js';

export class InvalidReviewException extends DomainException {
  constructor(message: string) {
    super(message, 'INVALID_REVIEW');
  }
}
