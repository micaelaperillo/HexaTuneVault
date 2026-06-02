import { DomainException } from '../domain.exception';

export class NotLikedException extends DomainException {
  constructor() {
    super('Review not liked', 'NOT_LIKED');
  }
}
