import { DomainException } from '../domain.exception';

export class InvalidTokenException extends DomainException {
  constructor() {
    super('Invalid or expired token', 'UNAUTHORIZED');
  }
}
