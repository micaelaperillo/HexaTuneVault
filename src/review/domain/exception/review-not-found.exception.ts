import { DomainException } from '@domain/exception/domain.exception.js';

export class ReviewNotFoundException extends DomainException {
  constructor() {
    super('Review not found', 'REVIEW_NOT_FOUND');
  }
}
