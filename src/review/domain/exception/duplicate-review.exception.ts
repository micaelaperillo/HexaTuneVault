import { DomainException } from './domain.exception.js';

export class DuplicateReviewException extends DomainException {
  constructor() {
    super('A review already exists for this subject', 'DUPLICATE_REVIEW');
  }
}
