import { DomainException } from '../domain.exception';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid username or password', 'UNAUTHORIZED');
  }
}
