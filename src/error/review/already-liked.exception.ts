import { DomainException } from '../domain.exception';

export class AlreadyLikedException extends DomainException {
  constructor() {
    super('Review already liked', 'ALREADY_LIKED');
  }
}
