import { DomainException } from '../domain.exception';

export class InvalidReviewException extends DomainException {
  constructor(message: string) {
    super(message, 'INVALID_REVIEW');
  }
}
