import { DomainException } from '../domain.exception';

export class ReviewNotFoundException extends DomainException {
  constructor() {
    super('Review not found', 'REVIEW_NOT_FOUND');
  }
}
